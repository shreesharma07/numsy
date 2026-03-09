import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { FileProcessorService } from '../services/file-processor.service';

/**
 * Controller for handling file upload and download operations
 */
@Controller('api')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor(private readonly fileProcessor: FileProcessorService) {
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  /**
   * Ensures required directories exist
   */
  private ensureDirectoriesExist(): void {
    [this.uploadDir, this.tempDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  health(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Upload and process file endpoint
   * Accepts CSV or Excel files and processes phone numbers
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `upload-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              'Invalid file type. Only CSV and Excel files are allowed.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    downloadId: string;
    summary: any;
  }> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`File uploaded: ${file.originalname} (${file.size} bytes)`);

    try {
      // Validate and sanitize file path before processing
      const normalizedFilePath = path.normalize(path.resolve(file.path));
      const normalizedUploadDir = path.normalize(path.resolve(this.uploadDir));

      // Ensure the file is within the upload directory
      if (!normalizedFilePath.startsWith(normalizedUploadDir + path.sep)) {
        this.logger.error(`File path outside upload directory: ${file.path}`);
        throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
      }

      // Check for path traversal attempts
      if (normalizedFilePath.includes('..')) {
        this.logger.error(`Path traversal attempt detected: ${file.path}`);
        throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
      }

      // Process the file
      const result = await this.fileProcessor.processFile(normalizedFilePath, this.tempDir);

      // Clean up uploaded file
      await this.fileProcessor.cleanupFiles([normalizedFilePath]);

      // Generate download ID (use timestamp from zip filename)
      const downloadId = path.basename(result.zipFilePath, '.zip');

      return {
        success: true,
        message: 'File processed successfully',
        downloadId,
        summary: {
          totalRecords: result.totalRecords,
          validRecords: result.validRecords,
          invalidRecords: result.invalidRecords,
          phoneColumnDetected: result.phoneColumn,
          analytics: result.analytics,
        },
      };
    } catch (error: unknown) {
      this.logger.error(`File processing error: ${(error as Error)?.message}`);

      // Clean up uploaded file on error (with proper validation)
      try {
        const normalizedFilePath = path.normalize(path.resolve(file.path));
        const normalizedUploadDir = path.normalize(path.resolve(this.uploadDir));

        // Only clean up if path is valid and within upload directory
        if (
          fs.existsSync(normalizedFilePath) &&
          normalizedFilePath.startsWith(normalizedUploadDir + path.sep) &&
          !normalizedFilePath.includes('..')
        ) {
          await this.fileProcessor.cleanupFiles([normalizedFilePath]);
        }
      } catch (cleanupError) {
        this.logger.error(`Cleanup error: ${(cleanupError as Error)?.message}`);
      }

      throw new HttpException(
        `Failed to process file: ${(error as Error)?.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Download processed ZIP file endpoint
   * Returns the ZIP file and then cleans it up
   */
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    // Sanitize the ID parameter to prevent path traversal attacks
    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!sanitizedId || sanitizedId !== id) {
      throw new HttpException('Invalid download ID', HttpStatus.BAD_REQUEST);
    }

    // Use basename to prevent directory traversal
    const safeFilename = path.basename(`${sanitizedId}.zip`);
    const tempDirResolved = path.resolve(this.tempDir);
    const zipFilePath = path.resolve(path.join(this.tempDir, safeFilename));

    // Ensure the resolved path is within the temp directory
    if (!zipFilePath.startsWith(tempDirResolved + path.sep) && zipFilePath !== tempDirResolved) {
      throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
    }

    if (!fs.existsSync(zipFilePath)) {
      throw new HttpException('File not found or already downloaded', HttpStatus.NOT_FOUND);
    }

    this.logger.log(`Downloading file: ${zipFilePath}`);

    try {
      // Final security check: Verify the normalized path is within temp directory
      const normalizedZipPath = path.normalize(zipFilePath);
      const normalizedTempDir = path.normalize(this.tempDir);

      // Additional check to prevent path traversal with normalized paths
      if (!normalizedZipPath.startsWith(normalizedTempDir + path.sep)) {
        this.logger.error(`Path traversal attempt detected: ${zipFilePath}`);
        throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
      }

      // Verify no parent directory references after normalization
      if (normalizedZipPath.includes('..')) {
        this.logger.error(`Path traversal attempt with .. detected: ${zipFilePath}`);
        throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
      }

      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="processed_numbers.zip"`);

      // Stream the file (now safely validated)
      const fileStream = fs.createReadStream(normalizedZipPath);

      fileStream.on('error', (error) => {
        this.logger.error(`Stream error: ${error.message}`);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error streaming file',
          });
        }
      });

      fileStream.on('end', () => {
        // Clean up files after download completes
        setTimeout(async () => {
          try {
            // Extract timestamp safely from the sanitized ID
            const idParts = sanitizedId.split('_');
            const timestamp = idParts.length > 1 ? idParts[1] : '';

            if (timestamp && /^\d+$/.test(timestamp)) {
              // Construct safe file paths using basename
              const validFilename = path.basename(`valid_numbers_${timestamp}.csv`);
              const invalidFilename = path.basename(`invalid_numbers_${timestamp}.csv`);

              const validFilePath = path.normalize(path.join(this.tempDir, validFilename));
              const invalidFilePath = path.normalize(path.join(this.tempDir, invalidFilename));

              // Validate paths are within temp directory before cleanup
              const normalizedTempDir = path.normalize(this.tempDir);
              const pathsToClean = [normalizedZipPath, validFilePath, invalidFilePath].filter(
                (p) => p.startsWith(normalizedTempDir + path.sep) && !p.includes('..'),
              );

              if (pathsToClean.length > 0) {
                await this.fileProcessor.cleanupFiles(pathsToClean);
                this.logger.log(`Cleaned up files for download ID: ${sanitizedId}`);
              }
            } else {
              // Only cleanup the zip file if we can't safely determine CSV filenames
              if (
                normalizedZipPath.startsWith(path.normalize(this.tempDir) + path.sep) &&
                !normalizedZipPath.includes('..')
              ) {
                await this.fileProcessor.cleanupFiles([normalizedZipPath]);
                this.logger.log(`Cleaned up zip file for download ID: ${sanitizedId}`);
              }
            }
          } catch (cleanupError: unknown) {
            this.logger.error(`Cleanup error: ${(cleanupError as Error)?.message}`);
          }
        }, 1000); // Small delay to ensure download completes
      });

      fileStream.pipe(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Download error: ${errorMessage}`);
      throw new HttpException('Failed to download file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cleanup old files endpoint (can be called manually or via cron)
   */
  @Post('cleanup')
  async cleanupOldFiles(): Promise<{ success: boolean; message: string }> {
    try {
      const directories = [this.uploadDir, this.tempDir];
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const dir of directories) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const dirResolved = path.resolve(dir);

          for (const file of files) {
            // Use basename to prevent directory traversal
            const safeFilename = path.basename(file);
            const filePath = path.normalize(path.resolve(path.join(dir, safeFilename)));
            const normalizedDir = path.normalize(dirResolved);

            // Ensure the file is within the intended directory
            if (!filePath.startsWith(normalizedDir + path.sep) && filePath !== normalizedDir) {
              this.logger.warn(`Skipping file outside directory: ${file}`);
              continue;
            }

            // Additional check for parent directory references
            if (filePath.includes('..') || safeFilename.includes('..')) {
              this.logger.warn(`Skipping file with parent directory reference: ${file}`);
              continue;
            }

            // Additional security: verify the file is actually a file and not a directory
            if (!fs.existsSync(filePath)) {
              continue;
            }

            const stats = fs.statSync(filePath);

            // Only delete regular files, not directories or special files
            if (!stats.isFile()) {
              this.logger.warn(`Skipping non-file: ${filePath}`);
              continue;
            }

            // Delete files older than 1 hour
            if (stats.mtimeMs < oneHourAgo) {
              // Final validation right before unlink
              if (
                filePath.startsWith(normalizedDir + path.sep) &&
                !filePath.includes('..') &&
                stats.isFile()
              ) {
                fs.unlinkSync(filePath);
                this.logger.debug(`Deleted old file: ${filePath}`);
              }
            }
          }
        }
      }

      return {
        success: true,
        message: 'Old files cleaned up successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cleanup error: ${errorMessage}`);
      throw new HttpException('Failed to cleanup files', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
