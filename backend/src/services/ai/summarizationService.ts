import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Summarization options
 */
export interface SummarizationOptions {
  maxLength?: number;
  style?: 'concise' | 'detailed' | 'bullet-points';
  language?: string;
}

/**
 * Summarization result
 */
export interface SummarizationResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  tokensUsed: number;
}

/**
 * AI Note Summarization Service using GPT-4
 * Provides intelligent summarization of notes with various styles
 */
export class SummarizationService {
  /**
   * Summarize note content
   * @param content - Note content to summarize
   * @param options - Summarization options
   * @returns Promise<SummarizationResult>
   */
  async summarize(
    content: string,
    options: SummarizationOptions = {}
  ): Promise<SummarizationResult> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const {
      maxLength = 150,
      style = 'concise',
      language = 'English'
    } = options;

    const systemPrompt = this.buildSystemPrompt(style, maxLength, language);
    const originalLength = content.length;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.5,
        max_tokens: maxLength * 2,
      });
    });

    const summary = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      summary,
      originalLength,
      summaryLength: summary.length,
      tokensUsed
    };
  }

  /**
   * Summarize multiple notes
   * @param contents - Array of note contents
   * @param options - Summarization options
   * @returns Promise<SummarizationResult[]>
   */
  async summarizeBatch(
    contents: string[],
    options: SummarizationOptions = {}
  ): Promise<SummarizationResult[]> {
    const results = await Promise.all(
      contents.map(content => this.summarize(content, options))
    );
    return results;
  }

  /**
   * Generate a title from note content
   * @param content - Note content
   * @param maxWords - Maximum words in title
   * @returns Promise<string>
   */
  async generateTitle(content: string, maxWords: number = 10): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const systemPrompt = `You are a helpful assistant that generates concise, descriptive titles for notes.
Generate a title that:
- Is no more than ${maxWords} words
- Captures the main topic or theme
- Is clear and descriptive
- Does not include quotes or special formatting
- Is in title case`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content.slice(0, 1000) } // Limit input
        ],
        temperature: 0.7,
        max_tokens: 50,
      });
    });

    return result.choices[0]?.message?.content?.trim() || 'Untitled Note';
  }

  /**
   * Extract key points from content
   * @param content - Note content
   * @param maxPoints - Maximum number of key points
   * @returns Promise<string[]>
   */
  async extractKeyPoints(content: string, maxPoints: number = 5): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const systemPrompt = `You are a helpful assistant that extracts key points from text.
Extract up to ${maxPoints} key points that:
- Capture the most important information
- Are concise and clear
- Are formatted as a numbered list
- Each point should be a complete thought`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.5,
        max_tokens: 300,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    
    // Parse numbered list
    const points = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(point => point.length > 0);

    return points.slice(0, maxPoints);
  }

  /**
   * Build system prompt based on style
   */
  private buildSystemPrompt(
    style: string,
    maxLength: number,
    language: string
  ): string {
    const basePrompt = `You are a helpful assistant that summarizes text in ${language}.`;
    
    switch (style) {
      case 'concise':
        return `${basePrompt} Provide a brief, concise summary (around ${maxLength} words) that captures the main points.`;
      
      case 'detailed':
        return `${basePrompt} Provide a detailed summary that covers all important points and maintains context.`;
      
      case 'bullet-points':
        return `${basePrompt} Provide a summary as bullet points, highlighting the key information clearly and concisely.`;
      
      default:
        return `${basePrompt} Provide a clear summary of the text.`;
    }
  }
}

// Singleton instance
export const summarizationService = new SummarizationService();
