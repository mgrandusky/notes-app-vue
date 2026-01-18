import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Sentiment analysis result
 */
export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  emotions: EmotionScore[];
  tokensUsed: number;
}

/**
 * Emotion score
 */
export interface EmotionScore {
  emotion: string;
  score: number;
}

/**
 * Mood tracking result
 */
export interface MoodResult {
  mood: string;
  intensity: number;
  factors: string[];
  suggestions: string[];
}

/**
 * Tone analysis result
 */
export interface ToneResult {
  primaryTone: string;
  tones: Array<{
    tone: string;
    score: number;
  }>;
  formality: 'formal' | 'neutral' | 'informal';
  tokensUsed: number;
}

/**
 * Sentiment Analysis Service
 * Provides emotion detection, mood tracking, and tone analysis
 */
export class SentimentService {
  /**
   * Analyze sentiment of text
   * @param text - Text to analyze
   * @returns Promise<SentimentResult>
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `You are an expert sentiment analyzer. Analyze the sentiment of the following text.

Provide your analysis in this exact format:
SENTIMENT: [positive/negative/neutral]
SCORE: [number between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive]
CONFIDENCE: [number between 0 and 1]
EMOTIONS: [emotion1:score1, emotion2:score2, ...]

Available emotions: joy, sadness, anger, fear, surprise, trust, anticipation, disgust
Emotion scores should be between 0 and 1.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 300,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return this.parseSentimentResponse(response, tokensUsed);
  }

  /**
   * Analyze sentiment of multiple texts (batch)
   * @param texts - Array of texts to analyze
   * @returns Promise<SentimentResult[]>
   */
  async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(
      texts.map(text => this.analyzeSentiment(text))
    );
    return results;
  }

  /**
   * Track mood from journal entry
   * @param journalEntry - Journal or note content
   * @returns Promise<MoodResult>
   */
  async trackMood(journalEntry: string): Promise<MoodResult> {
    if (!journalEntry || journalEntry.trim().length === 0) {
      throw new Error('Journal entry cannot be empty');
    }

    const systemPrompt = `You are a mood tracking assistant. Analyze this journal entry and identify:
1. The overall mood
2. Intensity (0-10 scale)
3. Factors contributing to the mood
4. Helpful suggestions for maintaining or improving mood

Format:
MOOD: [mood description]
INTENSITY: [0-10]
FACTORS:
- [factor 1]
- [factor 2]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: journalEntry }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    return this.parseMoodResponse(response);
  }

  /**
   * Analyze tone of text
   * @param text - Text to analyze
   * @returns Promise<ToneResult>
   */
  async analyzeTone(text: string): Promise<ToneResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `You are a tone analyzer. Analyze the tone of this text.

Identify:
1. Primary tone
2. Secondary tones with scores (0-1)
3. Formality level (formal/neutral/informal)

Format:
PRIMARY: [main tone]
TONES: [tone1:score1, tone2:score2, tone3:score3]
FORMALITY: [formal/neutral/informal]

Available tones: confident, friendly, professional, casual, enthusiastic, serious, humorous, empathetic, analytical, persuasive`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 200,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return this.parseToneResponse(response, tokensUsed);
  }

  /**
   * Get emotional insights from long-form text
   * @param text - Text to analyze
   * @returns Promise<string[]>
   */
  async getEmotionalInsights(text: string): Promise<string[]> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const systemPrompt = `Analyze the emotional patterns and provide 3-5 key insights about the emotional state expressed in this text.
Focus on underlying feelings, emotional progression, and significant emotional themes.
Format as a numbered list.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.5,
        max_tokens: 400,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    
    return response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(insight => insight.length > 0);
  }

  /**
   * Compare sentiment across time periods
   * @param texts - Array of texts with timestamps
   * @returns Promise<SentimentTrend>
   */
  async analyzeSentimentTrend(
    texts: Array<{ text: string; timestamp: Date }>
  ): Promise<{
    trend: 'improving' | 'declining' | 'stable';
    averageScore: number;
    dataPoints: Array<{ timestamp: Date; score: number }>;
  }> {
    // Analyze each text
    const results = await this.analyzeBatch(texts.map(t => t.text));
    
    // Create data points
    const dataPoints = texts.map((t, i) => ({
      timestamp: t.timestamp,
      score: results[i].score
    }));

    // Calculate average
    const averageScore = dataPoints.reduce((sum, dp) => sum + dp.score, 0) / dataPoints.length;

    // Determine trend
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, dp) => sum + dp.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, dp) => sum + dp.score, 0) / secondHalf.length;
    
    let trend: 'improving' | 'declining' | 'stable';
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.15) trend = 'improving';
    else if (difference < -0.15) trend = 'declining';
    else trend = 'stable';

    return {
      trend,
      averageScore,
      dataPoints
    };
  }

  /**
   * Parse sentiment response
   */
  private parseSentimentResponse(response: string, tokensUsed: number): SentimentResult {
    const sentimentMatch = response.match(/SENTIMENT:\s*(\w+)/i);
    const scoreMatch = response.match(/SCORE:\s*([-\d.]+)/i);
    const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/i);
    const emotionsMatch = response.match(/EMOTIONS:\s*(.+)/i);

    const sentiment = (sentimentMatch?.[1]?.toLowerCase() as any) || 'neutral';
    const score = parseFloat(scoreMatch?.[1] || '0');
    const confidence = parseFloat(confidenceMatch?.[1] || '0.5');

    const emotions: EmotionScore[] = [];
    if (emotionsMatch) {
      const emotionPairs = emotionsMatch[1].split(',');
      for (const pair of emotionPairs) {
        const [emotion, scoreStr] = pair.split(':').map(s => s.trim());
        if (emotion && scoreStr) {
          emotions.push({
            emotion,
            score: parseFloat(scoreStr) || 0
          });
        }
      }
    }

    return {
      sentiment,
      score,
      confidence,
      emotions,
      tokensUsed
    };
  }

  /**
   * Parse mood response
   */
  private parseMoodResponse(response: string): MoodResult {
    const moodMatch = response.match(/MOOD:\s*(.+)/i);
    const intensityMatch = response.match(/INTENSITY:\s*(\d+)/i);
    
    const mood = moodMatch?.[1]?.trim() || 'neutral';
    const intensity = parseInt(intensityMatch?.[1] || '5');

    const factors = this.extractBulletPoints(response, 'FACTORS:');
    const suggestions = this.extractBulletPoints(response, 'SUGGESTIONS:');

    return {
      mood,
      intensity,
      factors,
      suggestions
    };
  }

  /**
   * Parse tone response
   */
  private parseToneResponse(response: string, tokensUsed: number): ToneResult {
    const primaryMatch = response.match(/PRIMARY:\s*(.+)/i);
    const tonesMatch = response.match(/TONES:\s*(.+)/i);
    const formalityMatch = response.match(/FORMALITY:\s*(\w+)/i);

    const primaryTone = primaryMatch?.[1]?.trim() || 'neutral';
    const formality = (formalityMatch?.[1]?.toLowerCase() as any) || 'neutral';

    const tones: Array<{ tone: string; score: number }> = [];
    if (tonesMatch) {
      const tonePairs = tonesMatch[1].split(',');
      for (const pair of tonePairs) {
        const [tone, scoreStr] = pair.split(':').map(s => s.trim());
        if (tone && scoreStr) {
          tones.push({
            tone,
            score: parseFloat(scoreStr) || 0
          });
        }
      }
    }

    return {
      primaryTone,
      tones,
      formality,
      tokensUsed
    };
  }

  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string, startMarker: string): string[] {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return [];

    const afterMarker = text.slice(startIndex + startMarker.length);
    const nextSection = afterMarker.search(/^[A-Z]+:/m);
    const section = nextSection === -1 ? afterMarker : afterMarker.slice(0, nextSection);

    return section
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(point => point.length > 0);
  }
}

// Singleton instance
export const sentimentService = new SentimentService();
