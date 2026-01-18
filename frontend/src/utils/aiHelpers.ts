import type { AISuggestion } from '@/types/ai.types';

export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const extractKeywords = (text: string, maxKeywords: number = 10): string[] => {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

export const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'happy', 'love', 'best', 'awesome', 'perfect', 'brilliant',
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst',
    'hate', 'disappointing', 'sad', 'angry', 'frustrated', 'difficult',
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const difference = positiveCount - negativeCount;
  if (difference > 0) return 'positive';
  if (difference < 0) return 'negative';
  return 'neutral';
};

export const estimateComplexity = (text: string): 'simple' | 'moderate' | 'complex' => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  const complexityScore = avgWordsPerSentence * 0.5 + avgWordLength * 0.5;
  
  if (complexityScore < 12) return 'simple';
  if (complexityScore < 18) return 'moderate';
  return 'complex';
};

export const applySuggestion = (
  text: string,
  suggestion: AISuggestion
): string => {
  const { position, suggestion: newText } = suggestion;
  return (
    text.substring(0, position.start) +
    newText +
    text.substring(position.end)
  );
};

export const highlightSuggestions = (
  text: string,
  suggestions: AISuggestion[]
): Array<{ text: string; type?: string }> => {
  const segments: Array<{ text: string; type?: string; position: number }> = [];
  let lastPosition = 0;
  
  suggestions
    .sort((a, b) => a.position.start - b.position.start)
    .forEach(suggestion => {
      if (suggestion.position.start > lastPosition) {
        segments.push({
          text: text.substring(lastPosition, suggestion.position.start),
          position: lastPosition,
        });
      }
      
      segments.push({
        text: text.substring(suggestion.position.start, suggestion.position.end),
        type: suggestion.type,
        position: suggestion.position.start,
      });
      
      lastPosition = suggestion.position.end;
    });
  
  if (lastPosition < text.length) {
    segments.push({
      text: text.substring(lastPosition),
      position: lastPosition,
    });
  }
  
  return segments.map(({ text, type }) => ({ text, type }));
};

export const generatePromptContext = (noteContent: string, maxLength: number = 2000): string => {
  if (noteContent.length <= maxLength) {
    return noteContent;
  }
  
  const half = Math.floor(maxLength / 2);
  return noteContent.substring(0, half) + '\n...\n' + noteContent.substring(noteContent.length - half);
};

export const formatAIResponse = (response: string): string => {
  return response
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/gm, '');
};

export const tokenEstimate = (text: string): number => {
  return Math.ceil(text.split(/\s+/).length * 1.3);
};

export const shouldTriggerAIAssist = (text: string): boolean => {
  const triggers = [
    /summarize this/i,
    /what does this mean/i,
    /explain/i,
    /translate to/i,
    /suggest/i,
    /improve/i,
  ];
  
  return triggers.some(pattern => pattern.test(text));
};
