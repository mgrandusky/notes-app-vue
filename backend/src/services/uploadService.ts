import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Upload options
 */
export interface UploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
  fileNamePrefix?: string;
}

/**
 * Uploaded file info
 */
export interface UploadedFileInfo {
  originalName: string;
  fileName: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: Date;
}

/**
 * File Upload Service with Multer
 * Handles file uploads with validation, storage, and management
 */
export class UploadService {
  private readonly uploadsDir: string;
  private readonly defaultMaxSize: number;
  private readonly defaultAllowedTypes: string[];

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.defaultMaxSize = env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB
    this.defaultAllowedTypes = env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    this.ensureUploadDirectories();
  }

  /**
   * Ensure upload directories exist
   */
  private ensureUploadDirectories(): void {
    const directories = [
      this.uploadsDir,
      path.join(this.uploadsDir, 'images'),
      path.join(this.uploadsDir, 'documents'),
      path.join(this.uploadsDir, 'audio'),
      path.join(this.uploadsDir, 'temp')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Create multer middleware for single file upload
   * @param fieldName - Form field name
   * @param options - Upload options
   */
  single(fieldName: string, options: UploadOptions = {}): multer.Multer {
    return multer({
      storage: this.createStorage(options),
      limits: {
        fileSize: options.maxFileSize || this.defaultMaxSize,
      },
      fileFilter: this.createFileFilter(options)
    });
  }

  /**
   * Create multer middleware for multiple file upload
   * @param fieldName - Form field name
   * @param maxCount - Maximum number of files
   * @param options - Upload options
   */
  multiple(
    fieldName: string,
    maxCount: number = 10,
    options: UploadOptions = {}
  ): multer.Multer {
    return multer({
      storage: this.createStorage(options),
      limits: {
        fileSize: options.maxFileSize || this.defaultMaxSize,
        files: maxCount,
      },
      fileFilter: this.createFileFilter(options)
    });
  }

  /**
   * Create storage engine
   */
  private createStorage(options: UploadOptions): StorageEngine {
    return multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb) => {
        const dest = options.destination || this.getDestinationByMimeType(file.mimetype);
        cb(null, dest);
      },
      filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        const prefix = options.fileNamePrefix || 'upload';
        const fileName = `${prefix}-${Date.now()}-${uniqueSuffix}${ext}`;
        cb(null, fileName);
      }
    });
  }

  /**
   * Create file filter for validation
   */
  private createFileFilter(options: UploadOptions) {
    const allowedTypes = options.allowedMimeTypes || this.defaultAllowedTypes;

    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
      }
    };
  }

  /**
   * Get destination directory by MIME type
   */
  private getDestinationByMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return path.join(this.uploadsDir, 'images');
    }
    
    if (mimeType.startsWith('audio/')) {
      return path.join(this.uploadsDir, 'audio');
    }
    
    if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown'
    ) {
      return path.join(this.uploadsDir, 'documents');
    }

    return this.uploadsDir;
  }

  /**
   * Process uploaded file and return info
   * @param file - Multer file object
   */
  processUploadedFile(file: Express.Multer.File): UploadedFileInfo {
    return {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      extension: path.extname(file.originalname),
      uploadedAt: new Date()
    };
  }

  /**
   * Process multiple uploaded files
   * @param files - Array of multer file objects
   */
  processUploadedFiles(files: Express.Multer.File[]): UploadedFileInfo[] {
    return files.map(file => this.processUploadedFile(file));
  }

  /**
   * Delete uploaded file
   * @param filePath - Path to file
   */
  async deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve(); // File doesn't exist, consider it deleted
      }
    });
  }

  /**
   * Delete multiple files
   * @param filePaths - Array of file paths
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map(path => this.deleteFile(path)));
  }

  /**
   * Get file info
   * @param filePath - Path to file
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    createdAt?: Date;
    modifiedAt?: Date;
  }> {
    return new Promise((resolve) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          resolve({ exists: false });
        } else {
          resolve({
            exists: true,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      });
    });
  }

  /**
   * Validate file size
   * @param size - File size in bytes
   * @param maxSize - Maximum allowed size
   */
  validateFileSize(size: number, maxSize?: number): boolean {
    const limit = maxSize || this.defaultMaxSize;
    return size <= limit;
  }

  /**
   * Validate file type
   * @param mimeType - File MIME type
   * @param allowedTypes - Allowed MIME types
   */
  validateFileType(mimeType: string, allowedTypes?: string[]): boolean {
    const allowed = allowedTypes || this.defaultAllowedTypes;
    return allowed.includes(mimeType);
  }

  /**
   * Generate unique filename
   * @param originalName - Original filename
   * @param prefix - Optional prefix
   */
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const prefixStr = prefix ? `${prefix}-` : '';
    
    return `${prefixStr}${cleanName}-${Date.now()}-${uniqueSuffix}${ext}`;
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadsDir;
  }

  /**
   * Get file URL (relative path for serving)
   * @param filePath - Absolute file path
   */
  getFileUrl(filePath: string): string {
    const relativePath = path.relative(this.uploadsDir, filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Clean up old temporary files
   * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
   */
  async cleanupTempFiles(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const tempDir = path.join(this.uploadsDir, 'temp');
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve) => {
      fs.readdir(tempDir, async (err, files) => {
        if (err) {
          console.error('Error reading temp directory:', err);
          resolve(0);
          return;
        }

        for (const file of files) {
          const filePath = path.join(tempDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtimeMs;
            
            if (fileAge > maxAgeMs) {
              await this.deleteFile(filePath);
              deletedCount++;
            }
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
          }
        }

        resolve(deletedCount);
      });
    });
  }

  /**
   * Get disk usage statistics
   */
  async getDiskUsage(): Promise<{
    totalSize: number;
    imageSize: number;
    documentSize: number;
    audioSize: number;
    fileCount: number;
  }> {
    const calculateDirSize = async (dirPath: string): Promise<{ size: number; count: number }> => {
      let totalSize = 0;
      let fileCount = 0;

      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        } else if (stats.isDirectory()) {
          const subResult = await calculateDirSize(filePath);
          totalSize += subResult.size;
          fileCount += subResult.count;
        }
      }

      return { size: totalSize, count: fileCount };
    };

    const [images, documents, audio] = await Promise.all([
      calculateDirSize(path.join(this.uploadsDir, 'images')),
      calculateDirSize(path.join(this.uploadsDir, 'documents')),
      calculateDirSize(path.join(this.uploadsDir, 'audio'))
    ]);

    return {
      totalSize: images.size + documents.size + audio.size,
      imageSize: images.size,
      documentSize: documents.size,
      audioSize: audio.size,
      fileCount: images.count + documents.count + audio.count
    };
  }

  /**
   * Format file size to human readable
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// Singleton instance
export const uploadService = new UploadService();
