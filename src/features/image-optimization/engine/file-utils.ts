/**
 * Image Optimization Feature - File Utilities
 * 
 * File system operations and directory management
 * for image optimization workflow.
 */

import fs from 'fs-extra';
import path from 'path';
import type { 
  PostImages, 
  FileInfo, 
  FileResolutionResult,
  ProjectPaths,
  IFileUtils
} from './types.ts';
import { 
  PROJECT_PATHS, 
  SUPPORTED_EXTENSIONS, 
  SPECIAL_FILES 
} from './constants.ts';
import { isSupportedImage, isCoverImage } from './presets.ts';

/**
 * File Utilities Class
 * Handles all file system operations for image optimization
 */
export class FileUtils implements IFileUtils {
  private paths: ProjectPaths;

  constructor(customPaths?: Partial<ProjectPaths>) {
    this.paths = { ...PROJECT_PATHS, ...customPaths };
  }

  /**
   * Ensure required directories exist
   */
  public ensureDirectories(): void {
    fs.ensureDirSync(this.paths.rawDir);
    fs.ensureDirSync(this.paths.publicDir);
  }

  /**
   * Get all post directories from raw images folder
   */
  public getPostDirectories(): string[] {
    try {
      if (!fs.existsSync(this.paths.rawDir)) {
        return [];
      }

      return fs.readdirSync(this.paths.rawDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort();
    } catch (error) {
      console.error('Error reading post directories:', error);
      return [];
    }
  }

  /**
   * Get images from a specific post directory
   */
  public getPostImages(postId: string): PostImages {
    const postDir = path.join(this.paths.rawDir, postId);
    const directory = postDir;

    if (!fs.existsSync(postDir)) {
      return {
        directory,
        coverImages: [],
        otherImages: []
      };
    }

    try {
      const files = fs.readdirSync(postDir)
        .filter(file => isSupportedImage(file));

      const coverImages = files.filter(file => isCoverImage(file));
      const otherImages = files.filter(file => !isCoverImage(file));

      return {
        directory,
        coverImages: coverImages.sort(),
        otherImages: otherImages.sort()
      };
    } catch (error) {
      console.error(`Error reading images from ${postDir}:`, error);
      return {
        directory,
        coverImages: [],
        otherImages: []
      };
    }
  }

  /**
   * Check if image needs processing
   */
  public needsProcessing(sourcePath: string, outputPath: string, force: boolean): boolean {
    if (force) {
      return true;
    }

    if (!fs.existsSync(outputPath)) {
      return true;
    }

    try {
      const sourceStats = fs.statSync(sourcePath);
      const outputStats = fs.statSync(outputPath);
      
      // Process if source is newer than output
      return sourceStats.mtime > outputStats.mtime;
    } catch (error) {
      // If we can't get stats, assume processing is needed
      return true;
    }
  }

  /**
   * Create output directory for a post
   */
  public createOutputDirectory(postId: string): string {
    const outputDir = path.join(this.paths.publicDir, postId);
    fs.ensureDirSync(outputDir);
    return outputDir;
  }

  /**
   * Resolve file path and determine output location
   */
  public resolveFilePath(filePath: string, cwd: string = process.cwd()): FileResolutionResult {
    let absolutePath: string;
    
    // Handle relative paths
    if (!path.isAbsolute(filePath)) {
      absolutePath = path.resolve(cwd, filePath);
    } else {
      absolutePath = filePath;
    }

    const exists = fs.existsSync(absolutePath);
    
    // Check if file is in raw directory
    const rawDirAbsolute = path.resolve(cwd, this.paths.rawDir);
    const isInRawDir = absolutePath.startsWith(rawDirAbsolute);
    
    let relativePath = '';
    let outputPath = '';
    
    if (isInRawDir) {
      // Calculate relative path from raw directory
      relativePath = path.relative(rawDirAbsolute, absolutePath);
      
      // Generate output path in public directory
      const parsedPath = path.parse(relativePath);
      const outputFileName = `${parsedPath.name}.webp`; // Default to WebP
      outputPath = path.join(cwd, this.paths.publicDir, parsedPath.dir, outputFileName);
    }

    return {
      exists,
      absolutePath,
      isInRawDir,
      relativePath,
      outputPath
    };
  }

  /**
   * Get file information
   */
  public getFileInfo(filePath: string): FileInfo {
    const parsedPath = path.parse(filePath);
    const stats = fs.statSync(filePath);
    
    return {
      path: filePath,
      name: parsedPath.name,
      ext: parsedPath.ext,
      base: parsedPath.base,
      dir: parsedPath.dir,
      size: stats.size,
      modified: stats.mtime,
      isImage: isSupportedImage(parsedPath.base),
      isCover: isCoverImage(parsedPath.base)
    };
  }

  /**
   * Get project paths configuration
   */
  public getProjectPaths(projectRoot?: string): ProjectPaths {
    if (!projectRoot) {
      return this.paths;
    }

    return {
      rawDir: path.join(projectRoot, this.paths.rawDir),
      publicDir: path.join(projectRoot, this.paths.publicDir)
    };
  }

  /**
   * Clean up old or orphaned files
   */
  public async cleanupOldFiles(postId: string, keepFiles: string[] = []): Promise<number> {
    const outputDir = path.join(this.paths.publicDir, postId);
    
    if (!fs.existsSync(outputDir)) {
      return 0;
    }

    try {
      const files = await fs.readdir(outputDir);
      let deletedCount = 0;

      for (const file of files) {
        if (!keepFiles.includes(file)) {
          const filePath = path.join(outputDir, file);
          await fs.remove(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error(`Error cleaning up files in ${outputDir}:`, error);
      return 0;
    }
  }

  /**
   * Get disk usage for a directory
   */
  public async getDirectorySize(dirPath: string): Promise<number> {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error);
      return 0;
    }
  }

  /**
   * Create backup of original files
   */
  public async createBackup(sourcePath: string, backupDir: string): Promise<string> {
    const fileName = path.basename(sourcePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${timestamp}_${fileName}`;
    const backupPath = path.join(backupDir, backupFileName);

    await fs.ensureDir(backupDir);
    await fs.copy(sourcePath, backupPath);

    return backupPath;
  }

  /**
   * Validate file permissions
   */
  public validatePermissions(filePath: string): { read: boolean; write: boolean } {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      const read = true;
      
      let write = false;
      try {
        fs.accessSync(filePath, fs.constants.W_OK);
        write = true;
      } catch {
        // Write permission not available
      }

      return { read, write };
    } catch {
      return { read: false, write: false };
    }
  }
}

// Export singleton instance
export const fileUtils = new FileUtils();

// Export utility functions
export const {
  ensureDirectories,
  getPostDirectories,
  getPostImages,
  needsProcessing,
  createOutputDirectory,
  resolveFilePath
} = fileUtils;
