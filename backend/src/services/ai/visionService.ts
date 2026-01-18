import { openaiService } from './openaiService';
import { env } from '../../config/env';
import { readFileSync } from 'fs';

/**
 * Vision analysis result
 */
export interface VisionAnalysisResult {
  text: string;
  description: string;
  tokensUsed: number;
}

/**
 * OCR result
 */
export interface OCRResult {
  extractedText: string;
  language?: string;
  confidence: number;
  tokensUsed: number;
}

/**
 * Image description result
 */
export interface ImageDescriptionResult {
  description: string;
  detectedObjects: string[];
  suggestedTags: string[];
  tokensUsed: number;
}

/**
 * Image analysis options
 */
export interface ImageAnalysisOptions {
  detail?: 'low' | 'high' | 'auto';
  maxTokens?: number;
}

/**
 * Vision Service for OCR and Image Text Extraction
 * Uses GPT-4 Vision API for advanced image understanding
 */
export class VisionService {
  private readonly maxImageSize = 20 * 1024 * 1024; // 20MB
  private readonly supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

  /**
   * Extract text from image (OCR)
   * @param image - Image file path, URL, or base64 string
   * @param options - Analysis options
   * @returns Promise<OCRResult>
   */
  async extractText(
    image: string | Buffer,
    options: ImageAnalysisOptions = {}
  ): Promise<OCRResult> {
    const { detail = 'high', maxTokens = 1000 } = options;

    const systemPrompt = `You are an expert OCR system. Extract ALL text from the image accurately.
Preserve formatting, line breaks, and structure.
If there's no text, respond with "No text found."`;

    const imageContent = await this.prepareImageContent(image, detail);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              imageContent
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1,
      });
    });

    const extractedText = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      extractedText,
      confidence: extractedText === 'No text found.' ? 0 : 0.9,
      tokensUsed
    };
  }

  /**
   * Analyze and describe image content
   * @param image - Image file path, URL, or base64 string
   * @param prompt - Custom prompt for analysis
   * @param options - Analysis options
   * @returns Promise<VisionAnalysisResult>
   */
  async analyzeImage(
    image: string | Buffer,
    prompt: string = 'Describe this image in detail.',
    options: ImageAnalysisOptions = {}
  ): Promise<VisionAnalysisResult> {
    const { detail = 'auto', maxTokens = 500 } = options;
    const imageContent = await this.prepareImageContent(image, detail);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              imageContent
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });
    });

    const description = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      text: description,
      description,
      tokensUsed
    };
  }

  /**
   * Generate detailed image description
   * @param image - Image file path, URL, or base64 string
   * @param options - Analysis options
   * @returns Promise<ImageDescriptionResult>
   */
  async describeImage(
    image: string | Buffer,
    options: ImageAnalysisOptions = {}
  ): Promise<ImageDescriptionResult> {
    const { detail = 'high', maxTokens = 1000 } = options;

    const systemPrompt = `Analyze this image and provide:
1. A detailed description of what you see
2. List of main objects/elements (comma-separated)
3. Suggested tags for categorization (comma-separated)

Format:
DESCRIPTION:
[detailed description]

OBJECTS:
[object1, object2, object3]

TAGS:
[tag1, tag2, tag3]`;

    const imageContent = await this.prepareImageContent(image, detail);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              imageContent
            ]
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    // Parse response
    const description = this.extractSection(response, 'DESCRIPTION:', 'OBJECTS:');
    const objectsStr = this.extractSection(response, 'OBJECTS:', 'TAGS:');
    const tagsStr = this.extractSection(response, 'TAGS:', null);

    const detectedObjects = objectsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const suggestedTags = tagsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return {
      description,
      detectedObjects,
      suggestedTags,
      tokensUsed
    };
  }

  /**
   * Extract text and analyze image together
   * @param image - Image file path, URL, or base64 string
   * @param options - Analysis options
   * @returns Promise<{ ocr: OCRResult; description: ImageDescriptionResult }>
   */
  async extractAndAnalyze(
    image: string | Buffer,
    options: ImageAnalysisOptions = {}
  ): Promise<{ ocr: OCRResult; description: ImageDescriptionResult }> {
    const [ocr, description] = await Promise.all([
      this.extractText(image, options),
      this.describeImage(image, options)
    ]);

    return { ocr, description };
  }

  /**
   * Answer questions about an image
   * @param image - Image file path, URL, or base64 string
   * @param question - Question about the image
   * @param options - Analysis options
   * @returns Promise<VisionAnalysisResult>
   */
  async askAboutImage(
    image: string | Buffer,
    question: string,
    options: ImageAnalysisOptions = {}
  ): Promise<VisionAnalysisResult> {
    return this.analyzeImage(image, question, options);
  }

  /**
   * Batch process multiple images
   * @param images - Array of image paths/URLs/buffers
   * @param operation - Operation to perform
   * @returns Promise<OCRResult[]>
   */
  async batchProcess(
    images: (string | Buffer)[],
    operation: 'ocr' | 'describe' = 'ocr'
  ): Promise<(OCRResult | ImageDescriptionResult)[]> {
    const results = await Promise.all(
      images.map(image => 
        operation === 'ocr' 
          ? this.extractText(image)
          : this.describeImage(image)
      )
    );

    return results;
  }

  /**
   * Prepare image content for API request
   */
  private async prepareImageContent(
    image: string | Buffer,
    detail: 'low' | 'high' | 'auto'
  ): Promise<any> {
    // If it's a URL
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      return {
        type: 'image_url',
        image_url: {
          url: image,
          detail
        }
      };
    }

    // If it's a base64 string
    if (typeof image === 'string' && image.startsWith('data:image')) {
      return {
        type: 'image_url',
        image_url: {
          url: image,
          detail
        }
      };
    }

    // If it's a file path
    if (typeof image === 'string') {
      const imageBuffer = readFileSync(image);
      const base64 = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(image);
      
      return {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail
        }
      };
    }

    // If it's a Buffer
    if (Buffer.isBuffer(image)) {
      const base64 = image.toString('base64');
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail
        }
      };
    }

    throw new Error('Unsupported image format');
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return mimeTypes[ext || 'jpeg'] || 'image/jpeg';
  }

  /**
   * Extract section from formatted response
   */
  private extractSection(text: string, startMarker: string, endMarker: string | null): string {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';

    const contentStart = startIndex + startMarker.length;
    const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
    
    if (endIndex === -1) return text.slice(contentStart).trim();
    return text.slice(contentStart, endIndex).trim();
  }

  /**
   * Validate image file
   */
  validateImage(image: string | Buffer): void {
    if (typeof image === 'string' && !image.startsWith('http') && !image.startsWith('data:')) {
      const ext = image.split('.').pop()?.toLowerCase();
      if (!ext || !this.supportedFormats.includes(ext)) {
        throw new Error(`Unsupported image format. Supported: ${this.supportedFormats.join(', ')}`);
      }
    }

    if (Buffer.isBuffer(image) && image.length > this.maxImageSize) {
      throw new Error(`Image size exceeds maximum of ${this.maxImageSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }
}

// Singleton instance
export const visionService = new VisionService();
