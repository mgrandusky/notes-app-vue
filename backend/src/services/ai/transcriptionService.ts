import { openaiService } from './openaiService';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

/**
 * Transcription options
 */
export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

/**
 * Transcription result
 */
export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

/**
 * Transcription segment (for verbose output)
 */
export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

/**
 * Translation result
 */
export interface TranslationResult {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Voice-to-Text Transcription Service using Whisper API
 * Provides audio transcription and translation capabilities
 */
export class TranscriptionService {
  private readonly model = 'whisper-1';
  private readonly maxFileSize = 25 * 1024 * 1024; // 25MB limit
  private readonly supportedFormats = [
    'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
  ];

  /**
   * Transcribe audio file to text
   * @param audioFile - Path to audio file or File object
   * @param options - Transcription options
   * @returns Promise<TranscriptionResult>
   */
  async transcribe(
    audioFile: string | File | Buffer,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const {
      language,
      prompt,
      temperature = 0,
      format = 'verbose_json'
    } = options;

    // Validate file
    this.validateAudioFile(audioFile);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      
      // Handle different input types
      let fileStream: any;
      if (typeof audioFile === 'string') {
        fileStream = createReadStream(audioFile);
      } else if (audioFile instanceof Buffer) {
        fileStream = Readable.from(audioFile);
      } else {
        fileStream = audioFile;
      }

      return await client.audio.transcriptions.create({
        file: fileStream,
        model: this.model,
        language,
        prompt,
        temperature,
        response_format: format,
      });
    });

    // Parse result based on format
    if (format === 'verbose_json') {
      const verboseResult = result as any;
      return {
        text: verboseResult.text,
        language: verboseResult.language,
        duration: verboseResult.duration,
        segments: verboseResult.segments?.map((seg: any) => ({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          text: seg.text,
        }))
      };
    }

    return {
      text: typeof result === 'string' ? result : (result as any).text,
    };
  }

  /**
   * Translate audio to English
   * @param audioFile - Path to audio file or File object
   * @param options - Transcription options
   * @returns Promise<TranslationResult>
   */
  async translateToEnglish(
    audioFile: string | File | Buffer,
    options: Omit<TranscriptionOptions, 'language'> = {}
  ): Promise<TranslationResult> {
    const { prompt, temperature = 0 } = options;

    // Validate file
    this.validateAudioFile(audioFile);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      
      // Handle different input types
      let fileStream: any;
      if (typeof audioFile === 'string') {
        fileStream = createReadStream(audioFile);
      } else if (audioFile instanceof Buffer) {
        fileStream = Readable.from(audioFile);
      } else {
        fileStream = audioFile;
      }

      return await client.audio.translations.create({
        file: fileStream,
        model: this.model,
        prompt,
        temperature,
        response_format: 'verbose_json',
      });
    });

    const verboseResult = result as any;
    
    return {
      text: verboseResult.text,
      sourceLanguage: verboseResult.language || 'unknown',
      targetLanguage: 'en',
    };
  }

  /**
   * Transcribe audio with timestamps (for subtitles)
   * @param audioFile - Path to audio file or File object
   * @param format - Subtitle format ('srt' or 'vtt')
   * @param options - Transcription options
   * @returns Promise<string>
   */
  async transcribeWithTimestamps(
    audioFile: string | File | Buffer,
    format: 'srt' | 'vtt' = 'srt',
    options: TranscriptionOptions = {}
  ): Promise<string> {
    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      
      let fileStream: any;
      if (typeof audioFile === 'string') {
        fileStream = createReadStream(audioFile);
      } else if (audioFile instanceof Buffer) {
        fileStream = Readable.from(audioFile);
      } else {
        fileStream = audioFile;
      }

      return await client.audio.transcriptions.create({
        file: fileStream,
        model: this.model,
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature || 0,
        response_format: format,
      });
    });

    return result as string;
  }

  /**
   * Validate audio file
   */
  private validateAudioFile(audioFile: string | File | Buffer): void {
    if (!audioFile) {
      throw new Error('Audio file is required');
    }

    // Check file extension if string path
    if (typeof audioFile === 'string') {
      const extension = audioFile.split('.').pop()?.toLowerCase();
      if (!extension || !this.supportedFormats.includes(extension)) {
        throw new Error(
          `Unsupported audio format. Supported formats: ${this.supportedFormats.join(', ')}`
        );
      }
    }

    // Check file size if Buffer
    if (audioFile instanceof Buffer && audioFile.length > this.maxFileSize) {
      throw new Error(`Audio file size exceeds maximum of ${this.maxFileSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  /**
   * Estimate transcription cost
   * @param durationMinutes - Audio duration in minutes
   * @returns Estimated cost in USD
   */
  estimateCost(durationMinutes: number): number {
    // Whisper API: $0.006 per minute
    return durationMinutes * 0.006;
  }

  /**
   * Check if language is supported by Whisper
   * @param languageCode - ISO 639-1 language code
   * @returns boolean
   */
  isLanguageSupported(languageCode: string): boolean {
    // Whisper supports these languages (partial list)
    const supportedLanguages = [
      'en', 'zh', 'de', 'es', 'ru', 'ko', 'fr', 'ja', 'pt', 'tr', 'pl', 'ca',
      'nl', 'ar', 'sv', 'it', 'id', 'hi', 'fi', 'vi', 'he', 'uk', 'el', 'ms',
      'cs', 'ro', 'da', 'hu', 'ta', 'no', 'th', 'ur', 'hr', 'bg', 'lt', 'la'
    ];
    return supportedLanguages.includes(languageCode.toLowerCase());
  }
}

// Singleton instance
export const transcriptionService = new TranscriptionService();
