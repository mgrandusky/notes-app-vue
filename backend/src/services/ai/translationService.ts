import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Translation options
 */
export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

/**
 * Translation result
 */
export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tokensUsed: number;
}

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

/**
 * Language Translation Service
 * Provides high-quality translation using GPT-4
 */
export class TranslationService {
  private readonly supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar',
    'hi', 'nl', 'pl', 'sv', 'tr', 'vi', 'th', 'id', 'he', 'uk', 'cs',
    'ro', 'da', 'fi', 'no', 'el', 'hu', 'bn', 'ta', 'ur', 'fa', 'sw'
  ];

  private readonly languageNames: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
    pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
    ar: 'Arabic', hi: 'Hindi', nl: 'Dutch', pl: 'Polish', sv: 'Swedish',
    tr: 'Turkish', vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', he: 'Hebrew',
    uk: 'Ukrainian', cs: 'Czech', ro: 'Romanian', da: 'Danish', fi: 'Finnish',
    no: 'Norwegian', el: 'Greek', hu: 'Hungarian', bn: 'Bengali', ta: 'Tamil',
    ur: 'Urdu', fa: 'Persian', sw: 'Swahili'
  };

  /**
   * Translate text to target language
   * @param text - Text to translate
   * @param options - Translation options
   * @returns Promise<TranslationResult>
   */
  async translate(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const {
      sourceLanguage = 'auto',
      targetLanguage,
      preserveFormatting = true
    } = options;

    // Validate target language
    if (!this.isLanguageSupported(targetLanguage)) {
      throw new Error(`Unsupported target language: ${targetLanguage}`);
    }

    const targetLangName = this.languageNames[targetLanguage] || targetLanguage;
    const sourceLangInstruction = sourceLanguage === 'auto' 
      ? 'Detect the source language automatically and'
      : `Translate from ${this.languageNames[sourceLanguage] || sourceLanguage} to`;

    const systemPrompt = `You are a professional translator. ${sourceLangInstruction} translate the following text to ${targetLangName}.
${preserveFormatting ? 'Preserve all formatting, line breaks, and structure.' : ''}
Provide only the translation, without any explanations or additional text.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const translatedText = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    // Detect source language if auto
    let detectedSourceLang = sourceLanguage;
    if (sourceLanguage === 'auto') {
      const detection = await this.detectLanguage(text);
      detectedSourceLang = detection.language;
    }

    return {
      translatedText,
      sourceLanguage: detectedSourceLang,
      targetLanguage,
      tokensUsed
    };
  }

  /**
   * Translate to multiple languages
   * @param text - Text to translate
   * @param targetLanguages - Array of target language codes
   * @param sourceLanguage - Source language (optional)
   * @returns Promise<Map<string, TranslationResult>>
   */
  async translateMultiple(
    text: string,
    targetLanguages: string[],
    sourceLanguage?: string
  ): Promise<Map<string, TranslationResult>> {
    const translations = new Map<string, TranslationResult>();

    // Process translations in parallel
    const results = await Promise.all(
      targetLanguages.map(targetLang =>
        this.translate(text, { sourceLanguage, targetLanguage: targetLang })
      )
    );

    targetLanguages.forEach((lang, index) => {
      translations.set(lang, results[index]);
    });

    return translations;
  }

  /**
   * Detect language of text
   * @param text - Text to analyze
   * @returns Promise<LanguageDetectionResult>
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `Detect the language of the following text. 
Respond with only the ISO 639-1 language code (2 letters) and confidence (0-1), in this format: "code:confidence"
For example: "en:0.95" for English with 95% confidence.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text.slice(0, 500) }
        ],
        temperature: 0.1,
        max_tokens: 20,
      });
    });

    const response = result.choices[0]?.message?.content?.trim() || '';
    const [language, confidenceStr] = response.split(':');
    const confidence = parseFloat(confidenceStr) || 0.5;

    return {
      language: language.trim().toLowerCase(),
      confidence
    };
  }

  /**
   * Translate with context preservation
   * @param text - Text to translate
   * @param context - Additional context for better translation
   * @param targetLanguage - Target language
   * @returns Promise<TranslationResult>
   */
  async translateWithContext(
    text: string,
    context: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    const targetLangName = this.languageNames[targetLanguage] || targetLanguage;
    
    const systemPrompt = `You are a professional translator. Translate the following text to ${targetLangName}.
Use this context to improve translation accuracy:
${context}

Provide only the translation, without explanations.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const translatedText = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;
    const sourceLanguage = (await this.detectLanguage(text)).language;

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
      tokensUsed
    };
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.includes(languageCode.toLowerCase());
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return this.supportedLanguages.map(code => ({
      code,
      name: this.languageNames[code] || code
    }));
  }

  /**
   * Get language name from code
   */
  getLanguageName(code: string): string {
    return this.languageNames[code.toLowerCase()] || code;
  }
}

// Singleton instance
export const translationService = new TranslationService();
