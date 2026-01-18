import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Grammar check result
 */
export interface GrammarCheckResult {
  correctedText: string;
  hasErrors: boolean;
  corrections: GrammarCorrection[];
  tokensUsed: number;
}

/**
 * Grammar correction
 */
export interface GrammarCorrection {
  original: string;
  corrected: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  explanation: string;
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Writing improvement options
 */
export interface WritingImprovementOptions {
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  style?: 'concise' | 'detailed' | 'academic' | 'creative';
  preserveOriginal?: boolean;
}

/**
 * Writing improvement result
 */
export interface WritingImprovementResult {
  improvedText: string;
  suggestions: string[];
  tokensUsed: number;
}

/**
 * Grammar and Spell Checking Service
 * Provides comprehensive grammar, spelling, and writing improvement
 */
export class GrammarService {
  /**
   * Check and correct grammar and spelling
   * @param text - Text to check
   * @returns Promise<GrammarCheckResult>
   */
  async checkGrammar(text: string): Promise<GrammarCheckResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `You are an expert grammar and spelling checker. Analyze the provided text and:
1. Correct all grammar mistakes
2. Fix spelling errors
3. Improve punctuation
4. List each correction with explanation

Format your response as:
CORRECTED TEXT:
[corrected version]

CORRECTIONS:
- Original: [original text] → Corrected: [corrected text] | Type: [grammar/spelling/punctuation] | Explanation: [brief explanation]

If no errors are found, respond with:
CORRECTED TEXT:
[original text]

CORRECTIONS:
No errors found.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    // Parse response
    const { correctedText, corrections } = this.parseGrammarResponse(response, text);

    return {
      correctedText,
      hasErrors: corrections.length > 0,
      corrections,
      tokensUsed
    };
  }

  /**
   * Quick spell check only
   * @param text - Text to check
   * @returns Promise<GrammarCheckResult>
   */
  async checkSpelling(text: string): Promise<GrammarCheckResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `You are a spell checker. Correct only spelling mistakes in the text.
Do not change grammar, punctuation, or sentence structure.
Provide the corrected text and list all spelling corrections.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;
    const { correctedText, corrections } = this.parseGrammarResponse(response, text);

    return {
      correctedText,
      hasErrors: corrections.length > 0,
      corrections: corrections.map(c => ({ ...c, type: 'spelling' as const })),
      tokensUsed
    };
  }

  /**
   * Improve writing quality
   * @param text - Text to improve
   * @param options - Improvement options
   * @returns Promise<WritingImprovementResult>
   */
  async improveWriting(
    text: string,
    options: WritingImprovementOptions = {}
  ): Promise<WritingImprovementResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const {
      tone = 'professional',
      style = 'concise',
      preserveOriginal = false
    } = options;

    const systemPrompt = `You are a writing improvement expert. Improve the following text with these requirements:
- Tone: ${tone}
- Style: ${style}
${preserveOriginal ? '- Preserve the original meaning and key points' : '- Feel free to rephrase for better clarity'}

Provide:
1. The improved text
2. A list of key improvements made

Format:
IMPROVED TEXT:
[improved version]

IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
...`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    // Parse response
    const improvedText = this.extractSection(response, 'IMPROVED TEXT:', 'IMPROVEMENTS:') || text;
    const suggestions = this.extractBulletPoints(response, 'IMPROVEMENTS:');

    return {
      improvedText,
      suggestions,
      tokensUsed
    };
  }

  /**
   * Simplify complex text
   * @param text - Text to simplify
   * @param readingLevel - Target reading level
   * @returns Promise<WritingImprovementResult>
   */
  async simplifyText(
    text: string,
    readingLevel: 'elementary' | 'middle-school' | 'high-school' = 'high-school'
  ): Promise<WritingImprovementResult> {
    const systemPrompt = `You are an expert at simplifying complex text.
Rewrite the following text for a ${readingLevel} reading level.
Make it clear, easy to understand, while preserving all key information.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.5,
        max_tokens: Math.max(text.length * 2, 500),
      });
    });

    const improvedText = result.choices[0]?.message?.content?.trim() || text;
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      improvedText,
      suggestions: ['Text simplified for better readability'],
      tokensUsed
    };
  }

  /**
   * Parse grammar check response
   */
  private parseGrammarResponse(response: string, originalText: string): {
    correctedText: string;
    corrections: GrammarCorrection[];
  } {
    const correctedText = this.extractSection(response, 'CORRECTED TEXT:', 'CORRECTIONS:') || originalText;
    const correctionsSection = this.extractSection(response, 'CORRECTIONS:', null);

    const corrections: GrammarCorrection[] = [];

    if (correctionsSection && !correctionsSection.includes('No errors found')) {
      const lines = correctionsSection.split('\n').filter(line => line.trim().startsWith('-'));
      
      for (const line of lines) {
        const match = line.match(/Original:\s*(.+?)\s*→\s*Corrected:\s*(.+?)\s*\|\s*Type:\s*(\w+)\s*\|\s*Explanation:\s*(.+)/);
        
        if (match) {
          corrections.push({
            original: match[1].trim(),
            corrected: match[2].trim(),
            type: (match[3].toLowerCase() as any) || 'grammar',
            explanation: match[4].trim()
          });
        }
      }
    }

    return { correctedText, corrections };
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
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string, startMarker: string): string[] {
    const section = this.extractSection(text, startMarker, null);
    return section
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(point => point.length > 0);
  }
}

// Singleton instance
export const grammarService = new GrammarService();
