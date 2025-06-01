/**
 * Image Optimization Feature - Type Definitions
 * 
 * Comprehensive TypeScript types for image optimization system
 * with Sharp integration and CLI support.
 */

/** Supported image formats for output */
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';

/** Sharp fit options for image resizing */
export type FitOption = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

/** Log levels for the logger system */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/** Image preset configuration interface */
export interface ImagePreset {
  readonly width: number;
  readonly height?: number | null;
  readonly format: ImageFormat;
  readonly quality: number;
  readonly fit?: FitOption;
}

/** Image optimization configuration interface */
export interface ImageOptimizationConfig {
  readonly defaultPreset: string;
  readonly minDimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly maxFileSize: number;
  readonly lqip: {
    readonly width: number;
    readonly blur: number;
    readonly quality: number;
  };
}

/** Project paths configuration */
export interface ProjectPaths {
  readonly rawDir: string;
  readonly publicDir: string;
}

/** Image processing result interface */
export interface ProcessingResult {
  readonly success: boolean;
  readonly outputPath: string;
  readonly outputFileName: string;
  readonly preset: string;
  readonly format: ImageFormat;
  readonly size: number;
  readonly error: string | null;
}

/** LQIP generation result interface */
export interface LQIPResult {
  readonly success: boolean;
  readonly lqipPath: string;
  readonly base64Path: string;
  readonly dataUri: string | null;
  readonly size: number;
  readonly error: string | null;
}

/** Image metadata interface */
export interface ImageMetadata {
  readonly success: boolean;
  readonly width: number;
  readonly height: number;
  readonly format: string | null;
  readonly space?: string;
  readonly channels?: number;
  readonly depth?: string;
  readonly density?: number;
  readonly hasProfile?: boolean;
  readonly hasAlpha?: boolean;
  readonly error: string | null;
}

/** Image validation result interface */
export interface ImageValidationResult {
  readonly valid: boolean;
  readonly metadata: ImageMetadata;
  readonly error: string | null;
}

/** File information interface */
export interface FileInfo {
  readonly path: string;
  readonly name: string;
  readonly ext: string;
  readonly base: string;
  readonly dir: string;
  readonly size: number;
  readonly modified: Date;
  readonly isImage: boolean;
  readonly isCover: boolean;
}

/** File resolution result interface */
export interface FileResolutionResult {
  readonly exists: boolean;
  readonly absolutePath: string;
  readonly isInRawDir: boolean;
  readonly relativePath: string;
  readonly outputPath: string;
}

/** Post images structure interface */
export interface PostImages {
  readonly directory: string;
  readonly coverImages: string[];
  readonly otherImages: string[];
}

/** CLI arguments interface */
export interface CLIArguments {
  readonly postId?: string;
  readonly force?: boolean;
  readonly file?: string;
  readonly preset?: string;
  readonly debug?: boolean;
}

/** Processing statistics interface */
export interface ProcessingStats {
  readonly totalImages: number;
  readonly processedImages: number;
  readonly skippedImages: number;
  readonly errorImages: number;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
}

/** Preset validation result interface */
export interface PresetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** Image processor interface */
export interface IImageProcessor {
  processImageWithPreset(
    sourcePath: string,
    outputDir: string,
    outputFileName: string,
    presetName: string
  ): Promise<ProcessingResult>;
  
  generateLQIP(
    sourcePath: string,
    outputDir: string,
    baseName: string
  ): Promise<LQIPResult>;
  
  validateImage(imagePath: string): Promise<ImageValidationResult>;
  
  getImageMetadata(imagePath: string): Promise<ImageMetadata>;
}

/** File utilities interface */
export interface IFileUtils {
  ensureDirectories(): void;
  getPostDirectories(): string[];
  getPostImages(postId: string): PostImages;
  needsProcessing(sourcePath: string, outputPath: string, force: boolean): boolean;
  createOutputDirectory(postId: string): string;
  resolveFilePath(filePath: string, cwd?: string): FileResolutionResult;
}

/** Logger interface */
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error | any): void;
  progress(current: number, total: number, context?: string): void;
  finish(message: string): void;
  setLevel(level: LogLevel): void;
}

/** Optimized image component props */
export interface OptimizedImageProps {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  readonly class?: string;
  readonly lazy?: boolean;
  readonly decoding?: 'async' | 'sync' | 'auto';
  readonly fetchpriority?: 'high' | 'low' | 'auto';
  readonly sizes?: string;
  readonly debug?: boolean;
}

/** Image source set interface */
export interface ImageSourceSet {
  readonly avifSrc?: string;
  readonly webpSrc?: string;
  readonly fallbackSrc: string;
  readonly lqipSrc?: string;
}

/** Dimension calculation result */
export interface DimensionResult {
  readonly width: number;
  readonly height: number;
}

/** Image optimization error interface */
export interface ImageOptimizationError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** Feature metadata interface */
export interface FeatureMetadata {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly dependencies: readonly string[];
  readonly exports: {
    readonly components: readonly string[];
    readonly classes: readonly string[];
    readonly utilities: readonly string[];
    readonly types: readonly string[];
  };
  readonly capabilities: readonly string[];
  readonly integrations: {
    readonly cli: readonly string[];
    readonly components: readonly string[];
    readonly scripts: readonly string[];
  };
}
