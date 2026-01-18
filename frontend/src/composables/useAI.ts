import { storeToRefs } from 'pinia';
import { useAIStore } from '@/stores/ai';

export const useAI = () => {
  const aiStore = useAIStore();
  
  const {
    currentChatSession,
    chatSessions,
    summaries,
    translations,
    suggestions,
    isLoading,
    error,
  } = storeToRefs(aiStore);

  const summarizeNote = (noteId: string, length: 'short' | 'medium' | 'long' = 'medium') => {
    return aiStore.summarizeNote(noteId, length);
  };

  const translateNote = (noteId: string, targetLanguage: string) => {
    return aiStore.translateNote(noteId, targetLanguage);
  };

  const sendChatMessage = (message: string, noteId?: string) => {
    return aiStore.sendChatMessage(message, noteId);
  };

  const createChatSession = (noteId?: string) => {
    return aiStore.createChatSession(noteId);
  };

  const loadChatSession = (sessionId: string) => {
    return aiStore.loadChatSession(sessionId);
  };

  const deleteChatSession = (sessionId: string) => {
    return aiStore.deleteChatSession(sessionId);
  };

  const suggestTags = (noteId: string) => {
    return aiStore.suggestTags(noteId);
  };

  const improveWriting = (noteId: string) => {
    return aiStore.improveWriting(noteId);
  };

  const generateContent = (prompt: string, noteId?: string, context?: string) => {
    return aiStore.generateContent(prompt, noteId, context);
  };

  const analyzeNote = (noteId: string) => {
    return aiStore.analyzeNote(noteId);
  };

  const transcribeAudio = (audioBlob: Blob) => {
    return aiStore.transcribeAudio(audioBlob);
  };

  const rewriteContent = (noteId: string, style: 'formal' | 'casual' | 'concise' | 'detailed') => {
    return aiStore.rewriteContent(noteId, style);
  };

  const generateTitle = (content: string) => {
    return aiStore.generateTitle(content);
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
  };
};
