import OpenAI from 'openai';
import { env } from '../../config/env';

/**
 * Base OpenAI Service with error handling and retry logic
 * Provides centralized OpenAI client configuration and utilities
 */
export class OpenAIService {
  private client: OpenAI;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Get the OpenAI client instance
   */
  getClient(): OpenAI {
    return this.client;
  }

  /**
   * Retry logic wrapper for OpenAI API calls
   * @param fn - Function to execute with retry logic
   * @param retries - Number of retries (default: 3)
   * @returns Promise with the result
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error?.status === 400 || // Bad request
          error?.status === 401 || // Unauthorized
          error?.status === 403    // Forbidden
        ) {
          throw this.handleError(error);
        }

        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw this.handleError(error);
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Maximum retries exceeded');
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Centralized error handling for OpenAI API
   */
  handleError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      const { status, message, type } = error;
      
      switch (status) {
        case 400:
          return new Error(`OpenAI Bad Request: ${message}`);
        case 401:
          return new Error('OpenAI API Key is invalid or missing');
        case 403:
          return new Error('OpenAI API access forbidden');
        case 404:
          return new Error(`OpenAI resource not found: ${message}`);
        case 429:
          return new Error('OpenAI rate limit exceeded. Please try again later.');
        case 500:
        case 503:
          return new Error('OpenAI service is temporarily unavailable');
        default:
          return new Error(`OpenAI API Error (${status}): ${message}`);
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('An unknown error occurred with OpenAI service');
  }

  /**
   * Estimate token count (rough approximation)
   * @param text - Text to estimate
   * @returns Estimated token count
   */
  estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate API key is configured
   */
  validateApiKey(): void {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
  }

  /**
   * Check if the service is available
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const openaiService = new OpenAIService();
