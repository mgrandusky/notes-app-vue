import { defineStore } from 'pinia';
import { ref } from 'vue';
import { aiService } from '@/services/aiService';
import type {
  AISummary,
  AITranslation,
  AIChatSession,
  AISuggestion,
} from '@/types/ai.types';

export const useAIStore = defineStore('ai', () => {
  const currentChatSession = ref<AIChatSession | null>(null);
  const chatSessions = ref<AIChatSession[]>([]);
  const summaries = ref<Map<string, AISummary>>(new Map());
  const translations = ref<Map<string, AITranslation>>(new Map());
  const suggestions = ref<Map<string, AISuggestion[]>>(new Map());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const summarizeNote = async (noteId: string, length: 'short' | 'medium' | 'long' = 'medium') => {
    try {
      isLoading.value = true;
      error.value = null;
      const summary = await aiService.summarizeNote({ noteId, length });
      summaries.value.set(noteId, summary);
      return summary;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to summarize note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const translateNote = async (noteId: string, targetLanguage: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const translation = await aiService.translateNote({ noteId, targetLanguage });
      translations.value.set(`${noteId}-${targetLanguage}`, translation);
      return translation;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to translate note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const sendChatMessage = async (message: string, noteId?: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await aiService.chat({
        message,
        sessionId: currentChatSession.value?.id,
        noteId,
      });

      if (currentChatSession.value) {
        currentChatSession.value.messages.push({
          id: Date.now().toString(),
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        });
        currentChatSession.value.messages.push(response);
      }

      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createChatSession = async (noteId?: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const session = await aiService.createChatSession(noteId);
      currentChatSession.value = session;
      chatSessions.value.push(session);
      return session;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create chat session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const session = await aiService.getChatSession(sessionId);
      currentChatSession.value = session;
      return session;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load chat session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      await aiService.deleteChatSession(sessionId);
      chatSessions.value = chatSessions.value.filter(s => s.id !== sessionId);
      
      if (currentChatSession.value?.id === sessionId) {
        currentChatSession.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete chat session';
      throw err;
    }
  };

  const suggestTags = async (noteId: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const tagSuggestions = await aiService.suggestTags(noteId);
      return tagSuggestions;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to suggest tags';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const improveWriting = async (noteId: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const writingSuggestions = await aiService.improveWriting(noteId);
      suggestions.value.set(noteId, writingSuggestions);
      return writingSuggestions;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get writing suggestions';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const generateContent = async (
    prompt: string,
    noteId?: string,
    context?: string
  ) => {
    try {
      isLoading.value = true;
      error.value = null;
      const content = await aiService.generateContent({ prompt, noteId, context });
      return content;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate content';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const analyzeNote = async (noteId: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const analysis = await aiService.analyzeNote(noteId);
      return analysis;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze note';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      isLoading.value = true;
      error.value = null;
      const transcription = await aiService.transcribeAudio(audioBlob);
      return transcription;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to transcribe audio';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const rewriteContent = async (
    noteId: string,
    style: 'formal' | 'casual' | 'concise' | 'detailed'
  ) => {
    try {
      isLoading.value = true;
      error.value = null;
      const content = await aiService.rewriteContent(noteId, style);
      return content;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to rewrite content';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const generateTitle = async (content: string) => {
    try {
      const title = await aiService.generateTitle(content);
      return title;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate title';
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    currentChatSession,
    chatSessions,
    summaries,
    translations,
    suggestions,
    isLoading,
    error,
    summarizeNote,
    translateNote,
    sendChatMessage,
    createChatSession,
    loadChatSession,
    deleteChatSession,
    suggestTags,
    improveWriting,
    generateContent,
    analyzeNote,
    transcribeAudio,
    rewriteContent,
    generateTitle,
    clearError,
  };
});
