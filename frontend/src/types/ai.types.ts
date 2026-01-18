export interface AISummary {
  noteId: string;
  summary: string;
  keyPoints: string[];
  generatedAt: string;
}

export interface AITranslation {
  noteId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedContent: string;
  generatedAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  noteContext?: string;
}

export interface AIChatSession {
  id: string;
  noteId?: string;
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AITagSuggestion {
  tag: string;
  confidence: number;
  reason?: string;
}

export interface AISuggestion {
  type: 'grammar' | 'style' | 'clarity' | 'tone';
  original: string;
  suggestion: string;
  explanation: string;
  position: {
    start: number;
    end: number;
  };
}

export interface AIGenerateDto {
  prompt: string;
  noteId?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AISummarizeDto {
  noteId: string;
  length?: 'short' | 'medium' | 'long';
}

export interface AITranslateDto {
  noteId: string;
  targetLanguage: string;
}

export interface AIChatDto {
  message: string;
  sessionId?: string;
  noteId?: string;
}

export interface AIAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  entities: Entity[];
  readingTime: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'other';
  confidence: number;
}

export interface AIVoiceTranscription {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}
