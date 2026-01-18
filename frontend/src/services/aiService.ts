import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  AISummary,
  AITranslation,
  AIChatMessage,
  AIChatSession,
  AITagSuggestion,
  AISuggestion,
  AIGenerateDto,
  AISummarizeDto,
  AITranslateDto,
  AIChatDto,
  AIAnalysisResult,
  AIVoiceTranscription,
} from '@/types/ai.types';

export const aiService = {
  async summarizeNote(data: AISummarizeDto): Promise<AISummary> {
    const response = await api.post<ApiResponse<AISummary>>('/ai/summarize', data);
    return response.data.data;
  },

  async translateNote(data: AITranslateDto): Promise<AITranslation> {
    const response = await api.post<ApiResponse<AITranslation>>('/ai/translate', data);
    return response.data.data;
  },

  async chat(data: AIChatDto): Promise<AIChatMessage> {
    const response = await api.post<ApiResponse<AIChatMessage>>('/ai/chat', data);
    return response.data.data;
  },

  async getChatSession(sessionId: string): Promise<AIChatSession> {
    const response = await api.get<ApiResponse<AIChatSession>>(`/ai/chat/${sessionId}`);
    return response.data.data;
  },

  async createChatSession(noteId?: string): Promise<AIChatSession> {
    const response = await api.post<ApiResponse<AIChatSession>>('/ai/chat/session', { noteId });
    return response.data.data;
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    await api.delete(`/ai/chat/${sessionId}`);
  },

  async suggestTags(noteId: string): Promise<AITagSuggestion[]> {
    const response = await api.post<ApiResponse<AITagSuggestion[]>>(`/ai/suggest-tags`, {
      noteId,
    });
    return response.data.data;
  },

  async improveWriting(noteId: string): Promise<AISuggestion[]> {
    const response = await api.post<ApiResponse<AISuggestion[]>>('/ai/improve-writing', {
      noteId,
    });
    return response.data.data;
  },

  async generateContent(data: AIGenerateDto): Promise<string> {
    const response = await api.post<ApiResponse<{ content: string }>>('/ai/generate', data);
    return response.data.data.content;
  },

  async analyzeNote(noteId: string): Promise<AIAnalysisResult> {
    const response = await api.post<ApiResponse<AIAnalysisResult>>('/ai/analyze', { noteId });
    return response.data.data;
  },

  async transcribeAudio(audioBlob: Blob): Promise<AIVoiceTranscription> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await api.post<ApiResponse<AIVoiceTranscription>>(
      '/ai/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async extractKeyPoints(noteId: string): Promise<string[]> {
    const response = await api.post<ApiResponse<{ keyPoints: string[] }>>(
      '/ai/extract-key-points',
      { noteId }
    );
    return response.data.data.keyPoints;
  },

  async rewriteContent(noteId: string, style: 'formal' | 'casual' | 'concise' | 'detailed'): Promise<string> {
    const response = await api.post<ApiResponse<{ content: string }>>('/ai/rewrite', {
      noteId,
      style,
    });
    return response.data.data.content;
  },

  async generateTitle(content: string): Promise<string> {
    const response = await api.post<ApiResponse<{ title: string }>>('/ai/generate-title', {
      content,
    });
    return response.data.data.title;
  },
};
