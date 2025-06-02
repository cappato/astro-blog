/**
 * Image Optimization Feature - URL Processor
 * 
 * Extends the image processor to handle remote URLs
 * Downloads images and processes them through the existing pipeline
 */

import fs from 'fs-extra';
import path from 'path';
import { imageProcessor } from './image-processor.js';
import type { ProcessingResult, LQIPResult } from './types.js';

/**
 * URL Processing Configuration
 */
export const URL_CONFIG = {
  TEMP_DIR: 'temp/images',
  DOWNLOAD_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Supported URL patterns
  SUPPORTED_DOMAINS: [
    'images.unsplash.com',
    'unsplash.com',
    'picsum.photos',
    'via.placeholder.com'
  ]
};

/**
 * Download result interface
 */
interface DownloadResult {
  success: boolean;
  tempPath: string;
  originalUrl: string;
  size: number;
  error: string | null;
}

/**
 * URL Processor Class
 * Handles downloading and processing images from URLs
 */
export class URLProcessor {
  
  /**
   * Process image from URL with specific preset
   */
  public async processImageFromUrl(
    imageUrl: string,
    outputDir: string,
    outputFileName: string,
    presetName: string
  ): Promise<ProcessingResult> {
    let tempPath = '';
    
    try {
      // Download image to temporary location
      const downloadResult = await this.downloadImage(imageUrl);
      
      if (!downloadResult.success) {
        return {
          success: false,
          outputPath: '',
          outputFileName,
          preset: presetName,
          format: 'webp',
          size: 0,
          error: `Download failed: ${downloadResult.error}`
        };
      }
      
      tempPath = downloadResult.tempPath;
      
      // Process using existing image processor
      const result = await imageProcessor.processImageWithPreset(
        tempPath,
        outputDir,
        outputFileName,
        presetName
      );
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        outputPath: '',
        outputFileName,
        preset: presetName,
        format: 'webp',
        size: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      // Clean up temporary file
      if (tempPath) {
        await this.cleanupTempFile(tempPath);
      }
    }
  }
  
  /**
   * Process image from URL with multiple presets
   */
  public async processImageFromUrlMultiple(
    imageUrl: string,
    outputDir: string,
    outputFileName: string,
    presets: string[]
  ): Promise<ProcessingResult[]> {
    let tempPath = '';
    const results: ProcessingResult[] = [];
    
    try {
      // Download once, process multiple times
      const downloadResult = await this.downloadImage(imageUrl);
      
      if (!downloadResult.success) {
        // Return failed results for all presets
        return presets.map(preset => ({
          success: false,
          outputPath: '',
          outputFileName,
          preset,
          format: 'webp',
          size: 0,
          error: `Download failed: ${downloadResult.error}`
        }));
      }
      
      tempPath = downloadResult.tempPath;
      
      // Process with each preset
      for (const preset of presets) {
        const result = await imageProcessor.processImageWithPreset(
          tempPath,
          outputDir,
          outputFileName,
          preset
        );
        results.push(result);
      }
      
      return results;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return presets.map(preset => ({
        success: false,
        outputPath: '',
        outputFileName,
        preset,
        format: 'webp',
        size: 0,
        error: errorMessage
      }));
    } finally {
      // Clean up temporary file
      if (tempPath) {
        await this.cleanupTempFile(tempPath);
      }
    }
  }
  
  /**
   * Generate LQIP from URL
   */
  public async generateLQIPFromUrl(
    imageUrl: string,
    outputDir: string,
    baseName: string
  ): Promise<LQIPResult> {
    let tempPath = '';
    
    try {
      // Download image
      const downloadResult = await this.downloadImage(imageUrl);
      
      if (!downloadResult.success) {
        return {
          success: false,
          lqipPath: '',
          base64Path: '',
          dataUri: null,
          size: 0,
          error: `Download failed: ${downloadResult.error}`
        };
      }
      
      tempPath = downloadResult.tempPath;
      
      // Generate LQIP using existing processor
      const result = await imageProcessor.generateLQIP(tempPath, outputDir, baseName);
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        lqipPath: '',
        base64Path: '',
        dataUri: null,
        size: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      // Clean up temporary file
      if (tempPath) {
        await this.cleanupTempFile(tempPath);
      }
    }
  }
  
  /**
   * Download image from URL to temporary location
   */
  private async downloadImage(imageUrl: string): Promise<DownloadResult> {
    // Validate URL
    if (!this.isValidImageUrl(imageUrl)) {
      return {
        success: false,
        tempPath: '',
        originalUrl: imageUrl,
        size: 0,
        error: 'Invalid or unsupported image URL'
      };
    }
    
    // Create temp directory
    await fs.ensureDir(URL_CONFIG.TEMP_DIR);
    
    // Generate temp filename
    const urlHash = this.generateUrlHash(imageUrl);
    const extension = this.extractExtension(imageUrl) || 'jpg';
    const tempFileName = `${urlHash}.${extension}`;
    const tempPath = path.join(URL_CONFIG.TEMP_DIR, tempFileName);
    
    // Download with retries
    for (let attempt = 1; attempt <= URL_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(imageUrl, {
          signal: AbortSignal.timeout(URL_CONFIG.DOWNLOAD_TIMEOUT)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const buffer = await response.arrayBuffer();
        await fs.writeFile(tempPath, Buffer.from(buffer));
        
        const stats = await fs.stat(tempPath);
        
        return {
          success: true,
          tempPath,
          originalUrl: imageUrl,
          size: stats.size,
          error: null
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (attempt === URL_CONFIG.MAX_RETRIES) {
          return {
            success: false,
            tempPath,
            originalUrl: imageUrl,
            size: 0,
            error: `Failed after ${URL_CONFIG.MAX_RETRIES} attempts: ${errorMessage}`
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, URL_CONFIG.RETRY_DELAY * attempt));
      }
    }
    
    return {
      success: false,
      tempPath,
      originalUrl: imageUrl,
      size: 0,
      error: 'Unexpected error in download loop'
    };
  }
  
  /**
   * Validate if URL is a supported image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check if domain is supported
      const isSupported = URL_CONFIG.SUPPORTED_DOMAINS.some(domain => 
        urlObj.hostname.includes(domain)
      );
      
      if (!isSupported) {
        return false;
      }
      
      // Check if URL looks like an image
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(pathname);
      const isImageService = urlObj.hostname.includes('unsplash') || urlObj.hostname.includes('picsum');
      
      return hasImageExtension || isImageService;
      
    } catch {
      return false;
    }
  }
  
  /**
   * Extract file extension from URL
   */
  private extractExtension(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-z0-9]+)(\?|$)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
  
  /**
   * Generate hash for URL to create unique temp filename
   */
  private generateUrlHash(url: string): string {
    // Simple hash function for URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Clean up temporary file
   */
  private async cleanupTempFile(tempPath: string): Promise<void> {
    try {
      if (await fs.pathExists(tempPath)) {
        await fs.unlink(tempPath);
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn(`Failed to cleanup temp file ${tempPath}:`, error);
    }
  }
}

// Export singleton instance
export const urlProcessor = new URLProcessor();

// Export utility functions
export const {
  processImageFromUrl,
  processImageFromUrlMultiple,
  generateLQIPFromUrl
} = urlProcessor;
