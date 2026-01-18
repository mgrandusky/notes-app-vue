/**
 * Unit tests for OpenAI Service
 */
import { openaiService } from '../../../src/services/ai/openaiService';

describe('OpenAI Service', () => {
  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const text = 'Hello, world!';
      const tokens = openaiService.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    it('should return 0 for empty string', () => {
      const tokens = openaiService.estimateTokens('');
      expect(tokens).toBe(0);
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key is configured', () => {
      expect(() => openaiService.validateApiKey()).not.toThrow();
    });
  });
});
