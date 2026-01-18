import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat context (note information)
 */
export interface ChatContext {
  noteId?: string;
  noteTitle?: string;
  noteContent?: string;
  relatedNotes?: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Chat options
 */
export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Chat response
 */
export interface ChatResponse {
  message: string;
  tokensUsed: number;
  finishReason: string;
}

/**
 * AI Chatbot Assistant Service with Note Context
 * Provides conversational AI capabilities with context from user's notes
 */
export class ChatService {
  private readonly systemPrompt = `You are a helpful AI assistant for a note-taking application.
Your role is to help users:
- Understand and work with their notes
- Answer questions about their note content
- Provide suggestions for organizing and improving notes
- Help with writing, brainstorming, and note creation
- Offer summaries and insights from their notes

Guidelines:
- Be concise and helpful
- Reference specific notes when relevant
- Respect the user's note content and privacy
- Provide actionable suggestions
- Be creative when helping with writing tasks`;

  /**
   * Send a chat message with optional note context
   * @param message - User's message
   * @param context - Note context for the conversation
   * @param conversationHistory - Previous messages in the conversation
   * @param options - Chat options
   * @returns Promise<ChatResponse>
   */
  async chat(
    message: string,
    context?: ChatContext,
    conversationHistory: ChatMessage[] = [],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    const {
      temperature = 0.7,
      maxTokens = 1000,
      stream = false
    } = options;

    // Build messages array
    const messages = this.buildMessages(message, context, conversationHistory);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false, // Streaming handled separately if needed
      });
    });

    const responseMessage = result.choices[0]?.message?.content || '';
    const tokensUsed = result.usage?.total_tokens || 0;
    const finishReason = result.choices[0]?.finish_reason || 'stop';

    return {
      message: responseMessage,
      tokensUsed,
      finishReason
    };
  }

  /**
   * Stream chat response (for real-time responses)
   * @param message - User's message
   * @param context - Note context
   * @param conversationHistory - Previous messages
   * @param options - Chat options
   * @param onChunk - Callback for each chunk of the response
   */
  async *streamChat(
    message: string,
    context?: ChatContext,
    conversationHistory: ChatMessage[] = [],
    options: ChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    const { temperature = 0.7, maxTokens = 1000 } = options;
    const messages = this.buildMessages(message, context, conversationHistory);

    const client = openaiService.getClient();
    const stream = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Ask a question about a specific note
   * @param question - User's question
   * @param noteContent - Content of the note
   * @param noteTitle - Title of the note
   * @returns Promise<ChatResponse>
   */
  async askAboutNote(
    question: string,
    noteContent: string,
    noteTitle?: string
  ): Promise<ChatResponse> {
    const context: ChatContext = {
      noteTitle,
      noteContent
    };

    return this.chat(question, context);
  }

  /**
   * Get writing suggestions for a note
   * @param content - Current note content
   * @param intent - What the user wants to achieve
   * @returns Promise<ChatResponse>
   */
  async getWritingSuggestions(
    content: string,
    intent: string
  ): Promise<ChatResponse> {
    const message = `I'm working on a note and need help. ${intent}\n\nCurrent content:\n${content}`;
    
    return this.chat(message, { noteContent: content });
  }

  /**
   * Brainstorm ideas based on a topic
   * @param topic - Topic to brainstorm about
   * @param context - Optional note context
   * @returns Promise<ChatResponse>
   */
  async brainstorm(topic: string, context?: ChatContext): Promise<ChatResponse> {
    const message = `Help me brainstorm ideas about: ${topic}`;
    return this.chat(message, context);
  }

  /**
   * Compare and analyze multiple notes
   * @param notes - Array of notes to compare
   * @param question - Specific question about the notes
   * @returns Promise<ChatResponse>
   */
  async compareNotes(
    notes: Array<{ title: string; content: string }>,
    question: string
  ): Promise<ChatResponse> {
    const context: ChatContext = {
      relatedNotes: notes
    };

    const message = `${question}\n\nPlease analyze and compare these notes.`;
    return this.chat(message, context);
  }

  /**
   * Build messages array with context
   */
  private buildMessages(
    message: string,
    context?: ChatContext,
    conversationHistory: ChatMessage[] = []
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system prompt with context
    let systemMessage = this.systemPrompt;
    
    if (context) {
      systemMessage += '\n\n--- Current Context ---';
      
      if (context.noteTitle || context.noteContent) {
        systemMessage += `\n\nNote: "${context.noteTitle || 'Untitled'}"`;
        if (context.noteContent) {
          systemMessage += `\nContent: ${context.noteContent.slice(0, 2000)}`;
        }
      }
      
      if (context.relatedNotes && context.relatedNotes.length > 0) {
        systemMessage += '\n\nRelated Notes:';
        context.relatedNotes.forEach((note, index) => {
          systemMessage += `\n${index + 1}. "${note.title}": ${note.content.slice(0, 500)}`;
        });
      }
    }

    messages.push({ role: 'system', content: systemMessage });

    // Add conversation history
    messages.push(...conversationHistory);

    // Add current message
    messages.push({ role: 'user', content: message });

    return messages;
  }

  /**
   * Estimate conversation cost
   * @param messages - Array of messages
   * @returns Estimated cost in USD
   */
  estimateCost(messages: ChatMessage[]): number {
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalLength / 4);
    
    // GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
    // Rough estimate (assuming 50/50 split)
    const averageCostPer1K = 0.045;
    return (estimatedTokens / 1000) * averageCostPer1K;
  }
}

// Singleton instance
export const chatService = new ChatService();
