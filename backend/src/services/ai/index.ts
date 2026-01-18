/**
 * AI Services Index
 * Central export point for all AI-powered services
 */

// Base OpenAI Service
export { openaiService, OpenAIService } from './openaiService';

// AI Services
export {
  summarizationService,
  SummarizationService,
  type SummarizationOptions,
  type SummarizationResult
} from './summarizationService';

export {
  embeddingService,
  EmbeddingService,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type SimilarityResult
} from './embeddingService';

export {
  transcriptionService,
  TranscriptionService,
  type TranscriptionOptions,
  type TranscriptionResult,
  type TranscriptionSegment,
  type TranslationResult
} from './transcriptionService';

export {
  chatService,
  ChatService,
  type ChatMessage,
  type ChatContext,
  type ChatOptions,
  type ChatResponse
} from './chatService';

export {
  translationService,
  TranslationService,
  type TranslationOptions,
  type TranslationResult as TextTranslationResult,
  type LanguageDetectionResult
} from './translationService';

export {
  grammarService,
  GrammarService,
  type GrammarCheckResult,
  type GrammarCorrection,
  type WritingImprovementOptions,
  type WritingImprovementResult
} from './grammarService';

export {
  visionService,
  VisionService,
  type VisionAnalysisResult,
  type OCRResult,
  type ImageDescriptionResult,
  type ImageAnalysisOptions
} from './visionService';

export {
  contentGenerationService,
  ContentGenerationService,
  type ContentGenerationOptions,
  type ContentGenerationResult,
  type OutlineItem,
  type TemplateType
} from './contentGenerationService';

export {
  sentimentService,
  SentimentService,
  type SentimentResult,
  type EmotionScore,
  type MoodResult,
  type ToneResult
} from './sentimentService';
