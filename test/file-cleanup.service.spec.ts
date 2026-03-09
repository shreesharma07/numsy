/**
 * FileCleanupService Tests
 * Comprehensive test suite for automatic file cleanup service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { FileCleanupService } from '../src/services/file-cleanup.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('FileCleanupService', () => {
  let service: FileCleanupService;
  let mockFs: jest.Mocked<typeof fs>;
  let setIntervalSpy: jest.SpyInstance;
  let setTimeoutSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;

  // Mock directories
  const mockUploadDir = path.join(process.cwd(), 'uploads');
  const mockTempDir = path.join(process.cwd(), 'Temp');

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Spy on timer functions
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    // Get mocked fs
    mockFs = fs as jest.Mocked<typeof fs>;

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileCleanupService],
    }).compile();

    service = module.get<FileCleanupService>(FileCleanupService);

    // Mock Logger to suppress console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct default configuration', () => {
      const stats = service.getCleanupStats();
      expect(stats.uploadDir).toBe(mockUploadDir);
      expect(stats.tempDir).toBe(mockTempDir);
      expect(stats.maxFileAgeMinutes).toBe(5);
    });
  });

  describe('onModuleInit', () => {
    it('should initialize and start cleanup process', async () => {
      // Mock directory exists and is empty
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      await service.onModuleInit();

      // Verify logger was called
      expect(Logger.prototype.log).toHaveBeenCalledWith('🧹 File Cleanup Service initialized');
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        '🗑️  Flushing all uploaded and temporary files on startup...',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        '⏰ Starting cleanup cron job (runs every 1 minute)',
      );
    });

    it('should create directories if they do not exist', async () => {
      // Mock directories don't exist
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => undefined);

      await service.onModuleInit();

      // Verify directories were created
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockUploadDir, {
        recursive: true,
      });
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockTempDir, {
        recursive: true,
      });
    });

    it('should flush existing files on startup', async () => {
      const mockFiles = ['file1.csv', 'file2.xlsx', 'file3.zip'];

      // Mock directory exists with files
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as any);
      mockFs.statSync.mockReturnValue({ isFile: () => true } as any);
      mockFs.unlinkSync.mockImplementation(() => undefined);

      await service.onModuleInit();

      // Verify files were deleted
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(mockFiles.length * 2); // 2 directories
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `✅ Flushed ${mockFiles.length * 2} file(s) from upload directories`,
      );
    });
  });

  describe('flushAllFiles', () => {
    it('should delete all files from both directories', async () => {
      const uploadFiles = ['upload1.csv', 'upload2.xlsx'];
      const tempFiles = ['temp1.txt', 'temp2.zip'];

      // Mock directories exist with files
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(uploadFiles as any)
        .mockReturnValueOnce(tempFiles as any);
      mockFs.statSync.mockReturnValue({ isFile: () => true } as any);
      mockFs.unlinkSync.mockImplementation(() => undefined);

      await (service as any).flushAllFiles();

      // Verify all files were deleted
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(4);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        '✅ Flushed 4 file(s) from upload directories',
      );
    });

    it('should handle empty directories', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      await (service as any).flushAllFiles();

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        '✅ No files to flush - directories are clean',
      );
    });

    it('should skip subdirectories and only delete files', async () => {
      const items = ['file.csv', 'subfolder'];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(items as any);
      mockFs.statSync
        .mockReturnValueOnce({ isFile: () => true } as any) // file.csv in uploads
        .mockReturnValueOnce({ isFile: () => false } as any) // subfolder in uploads
        .mockReturnValueOnce({ isFile: () => true } as any) // file.csv in temp
        .mockReturnValueOnce({ isFile: () => false } as any); // subfolder in temp

      await (service as any).flushAllFiles();

      // Only one file should be deleted per directory (2 directories = 2 files)
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await (service as any).flushAllFiles();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error flushing directory'),
        'Permission denied',
      );
    });
  });

  describe('startCleanupCron', () => {
    it('should start interval for periodic cleanup', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      (service as any).startCleanupCron();

      // Verify setInterval was called with 60000ms (1 minute)
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it('should schedule immediate cleanup after 10 seconds', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      (service as any).startCleanupCron();

      // Verify setTimeout was called with 10000ms
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
    });

    it('should run cleanup when timer fires', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      (service as any).startCleanupCron();

      // Fast-forward time by 60 seconds
      jest.advanceTimersByTime(60000);

      // Verify cleanup was called (readdirSync called for both directories)
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });
  });

  describe('cleanupOldFiles', () => {
    it('should delete files older than 5 minutes', () => {
      const now = Date.now();
      const oldFileTime = now - 6 * 60 * 1000; // 6 minutes ago
      const recentFileTime = now - 2 * 60 * 1000; // 2 minutes ago

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['old-file.csv', 'recent-file.csv'] as any);
      mockFs.statSync
        .mockReturnValueOnce({
          isFile: () => true,
          mtimeMs: oldFileTime,
        } as any)
        .mockReturnValueOnce({
          isFile: () => true,
          mtimeMs: recentFileTime,
        } as any)
        .mockReturnValueOnce({
          isFile: () => true,
          mtimeMs: oldFileTime,
        } as any)
        .mockReturnValueOnce({
          isFile: () => true,
          mtimeMs: recentFileTime,
        } as any);
      mockFs.unlinkSync.mockImplementation(() => undefined);

      (service as any).cleanupOldFiles();

      // Only old files should be deleted (2 old files in 2 directories)
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Deleted expired file'),
      );
    });

    it('should not delete files younger than 5 minutes', () => {
      const now = Date.now();
      const recentFileTime = now - 3 * 60 * 1000; // 3 minutes ago

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['recent-file.csv'] as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: recentFileTime,
      } as any);

      (service as any).cleanupOldFiles();

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        '✅ Cleanup completed: No expired files found',
      );
    });

    it('should handle non-existent directories', () => {
      mockFs.existsSync.mockReturnValue(false);

      (service as any).cleanupOldFiles();

      expect(mockFs.readdirSync).not.toHaveBeenCalled();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle errors during cleanup', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Disk error');
      });

      (service as any).cleanupOldFiles();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error cleaning directory'),
        'Disk error',
      );
    });

    it('should log file age when deleting', () => {
      const now = Date.now();
      const fileTime = now - 7 * 60 * 1000; // 7 minutes ago

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['old-file.csv'] as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: fileTime,
      } as any);

      (service as any).cleanupOldFiles();

      expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('7 minutes old'));
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear cleanup interval on module destroy', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      await service.onModuleInit();

      // Clear mocks to isolate destroy test
      jest.clearAllMocks();

      service.onModuleDestroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith('⏸️  Cleanup cron job stopped');
    });

    it('should handle destroy when interval is not set', () => {
      service.onModuleDestroy();

      // Should not throw error
      expect(clearIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('triggerCleanup', () => {
    it('should manually trigger cleanup', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      service.triggerCleanup();

      expect(Logger.prototype.log).toHaveBeenCalledWith('🔄 Manual cleanup triggered');
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });

    it('should delete old files when manually triggered', () => {
      const now = Date.now();
      const oldFileTime = now - 6 * 60 * 1000;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['old-file.csv'] as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: oldFileTime,
      } as any);

      service.triggerCleanup();

      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2); // 2 directories
    });
  });

  describe('getCleanupStats', () => {
    it('should return correct statistics', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['file1.csv', 'file2.xlsx'] as any) // uploads
        .mockReturnValueOnce(['temp1.txt'] as any); // temp
      mockFs.statSync.mockReturnValue({ isFile: () => true } as any);

      const stats = service.getCleanupStats();

      expect(stats).toEqual({
        uploadDir: mockUploadDir,
        tempDir: mockTempDir,
        maxFileAgeMinutes: 5,
        currentFiles: {
          uploads: 2,
          temp: 1,
        },
      });
    });

    it('should return zero counts for non-existent directories', () => {
      mockFs.existsSync.mockReturnValue(false);

      const stats = service.getCleanupStats();

      expect(stats.currentFiles.uploads).toBe(0);
      expect(stats.currentFiles.temp).toBe(0);
    });

    it('should handle errors when reading directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const stats = service.getCleanupStats();

      expect(stats.currentFiles.uploads).toBe(0);
      expect(stats.currentFiles.temp).toBe(0);
    });

    it('should only count files, not directories', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['file1.csv', 'subfolder', 'file2.xlsx'] as any);
      mockFs.statSync
        .mockReturnValueOnce({ isFile: () => true } as any)
        .mockReturnValueOnce({ isFile: () => false } as any)
        .mockReturnValueOnce({ isFile: () => true } as any);

      const stats = service.getCleanupStats();

      expect(stats.currentFiles.uploads).toBe(2); // Only files, not subfolder
    });
  });

  describe('Integration Tests', () => {
    it('should complete full lifecycle: init -> cleanup -> destroy', async () => {
      const now = Date.now();
      const oldFileTime = now - 6 * 60 * 1000;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce(['initial1.csv'] as any) // flush uploads
        .mockReturnValueOnce(['initial2.txt'] as any) // flush temp
        .mockReturnValue(['old-file.csv'] as any); // cleanup iterations
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: oldFileTime,
      } as any);

      // Initialize
      await service.onModuleInit();
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2); // Initial flush

      // Run cleanup cycle
      jest.advanceTimersByTime(60000);
      expect(mockFs.unlinkSync).toHaveBeenCalled();

      // Destroy
      service.onModuleDestroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should handle multiple cleanup cycles', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      await service.onModuleInit();

      // Fast-forward through multiple cycles
      jest.advanceTimersByTime(180000); // 3 minutes

      // Verify cleanup ran multiple times (every 60 seconds)
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });

    it('should continue working after errors', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockImplementationOnce(() => {
          throw new Error('Temporary error');
        })
        .mockReturnValue([]);

      await service.onModuleInit();

      // Should log error but continue
      expect(Logger.prototype.error).toHaveBeenCalled();

      // Trigger another cleanup
      jest.advanceTimersByTime(60000);

      // Should still work
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle file exactly at 5-minute threshold', () => {
      const now = Date.now();
      const exactThreshold = now - 5 * 60 * 1000; // Exactly 5 minutes

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['threshold-file.csv'] as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: exactThreshold,
      } as any);

      (service as any).cleanupOldFiles();

      // File exactly at threshold should NOT be deleted (> not >=)
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle file just over 5-minute threshold', () => {
      const now = Date.now();
      const justOver = now - (5 * 60 * 1000 + 1); // 5 minutes + 1ms

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['just-over.csv'] as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: justOver,
      } as any);

      (service as any).cleanupOldFiles();

      // File just over threshold SHOULD be deleted
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2); // 2 directories
    });

    it('should handle very large file lists', () => {
      const largeFileList = Array.from({ length: 1000 }, (_, i) => `file${i}.csv`);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(largeFileList as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: Date.now() - 10 * 60 * 1000, // 10 minutes old
      } as any);

      (service as any).cleanupOldFiles();

      // Should delete all 1000 files in both directories
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(2000);
    });

    it('should handle mixed file types and extensions', () => {
      const mixedFiles = ['data.csv', 'report.xlsx', 'archive.zip', 'document.pdf', 'no-extension'];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mixedFiles as any);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        mtimeMs: Date.now() - 6 * 60 * 1000,
      } as any);

      (service as any).cleanupOldFiles();

      // All files should be deleted regardless of extension
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(mixedFiles.length * 2);
    });
  });
});
