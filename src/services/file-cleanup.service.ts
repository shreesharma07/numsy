import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service for automatic cleanup of uploaded and temporary files
 * - Deletes files older than 5 minutes
 * - Flushes all files on application start
 * - Runs periodic cleanup every minute
 */
@Injectable()
export class FileCleanupService implements OnModuleInit {
  private readonly logger = new Logger(FileCleanupService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly tempDir = path.join(process.cwd(), 'Temp');
  private readonly maxFileAge = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  /**
   * Called when the module is initialized
   * Performs initial cleanup and starts the cron job
   */
  async onModuleInit() {
    this.logger.log('🧹 File Cleanup Service initialized');

    // Flush all files on startup
    await this.flushAllFiles();

    // Start periodic cleanup (every minute)
    this.startCleanupCron();
  }

  /**
   * Flush all uploaded and temporary files on application start
   */
  private async flushAllFiles(): Promise<void> {
    this.logger.log('🗑️  Flushing all uploaded and temporary files on startup...');

    const directories = [this.uploadDir, this.tempDir];
    let totalDeleted = 0;

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
        continue;
      }

      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            fs.unlinkSync(filePath);
            totalDeleted++;
            this.logger.debug(`Deleted on startup: ${file}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error flushing directory ${dir}:`, error.message);
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`✅ Flushed ${totalDeleted} file(s) from upload directories`);
    } else {
      this.logger.log('✅ No files to flush - directories are clean');
    }
  }

  /**
   * Start the periodic cleanup cron job
   * Runs every minute to delete files older than 5 minutes
   */
  private startCleanupCron(): void {
    this.logger.log('⏰ Starting cleanup cron job (runs every 1 minute)');

    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldFiles();
    }, 60 * 1000); // 1 minute

    // Also run immediately after a short delay
    setTimeout(() => {
      this.cleanupOldFiles();
    }, 10000); // 10 seconds after startup
  }

  /**
   * Clean up files older than 5 minutes
   */
  private cleanupOldFiles(): void {
    const now = Date.now();
    const directories = [this.uploadDir, this.tempDir];
    let totalDeleted = 0;

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        continue;
      }

      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            const fileAge = now - stats.mtimeMs;

            if (fileAge > this.maxFileAge) {
              fs.unlinkSync(filePath);
              totalDeleted++;
              const ageInMinutes = Math.floor(fileAge / 60000);
              this.logger.log(`🗑️  Deleted expired file: ${file} (${ageInMinutes} minutes old)`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error cleaning directory ${dir}:`, error.message);
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`✅ Cleanup completed: ${totalDeleted} file(s) deleted`);
    } else {
      this.logger.debug('✅ Cleanup completed: No expired files found');
    }
  }

  /**
   * Stop the cleanup cron job (called on application shutdown)
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.logger.log('⏸️  Cleanup cron job stopped');
    }
  }

  /**
   * Manual trigger for cleanup (can be called from other services)
   */
  public triggerCleanup(): void {
    this.logger.log('🔄 Manual cleanup triggered');
    this.cleanupOldFiles();
  }

  /**
   * Get cleanup statistics
   */
  public getCleanupStats(): {
    uploadDir: string;
    tempDir: string;
    maxFileAgeMinutes: number;
    currentFiles: { uploads: number; temp: number };
  } {
    const getFileCount = (dir: string): number => {
      if (!fs.existsSync(dir)) return 0;
      try {
        return fs.readdirSync(dir).filter((file) => {
          const filePath = path.join(dir, file);
          return fs.statSync(filePath).isFile();
        }).length;
      } catch {
        return 0;
      }
    };

    return {
      uploadDir: this.uploadDir,
      tempDir: this.tempDir,
      maxFileAgeMinutes: this.maxFileAge / 60000,
      currentFiles: {
        uploads: getFileCount(this.uploadDir),
        temp: getFileCount(this.tempDir),
      },
    };
  }
}
