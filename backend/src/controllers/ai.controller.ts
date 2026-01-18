import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import openai, { OPENAI_CONFIG } from '../config/openai';
import { AppError } from '../middleware/errorHandler';

export const summarizeNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { noteId } = req.body;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    if (!note.content || note.content.trim().length === 0) {
      throw new AppError(400, 'Note content is empty');
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes notes concisely and accurately.',
        },
        {
          role: 'user',
          content: `Please provide a concise summary of the following note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`,
        },
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary';

    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

export const suggestTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { noteId } = req.body;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    if (!note.content || note.content.trim().length === 0) {
      throw new AppError(400, 'Note content is empty');
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests relevant tags for notes. Return only a JSON array of strings, no additional text.',
        },
        {
          role: 'user',
          content: `Suggest 3-5 relevant tags for this note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    let tags: string[] = [];

    try {
      tags = JSON.parse(responseText);
    } catch {
      const tagMatches = responseText.match(/"([^"]+)"/g);
      if (tagMatches) {
        tags = tagMatches.map((tag) => tag.replace(/"/g, ''));
      }
    }

    res.status(200).json({ tags });
  } catch (error) {
    next(error);
  }
};

export const generateContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prompt, noteId } = req.body;

    let context = '';
    if (noteId) {
      const userId = req.user!.id;
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId },
      });

      if (note) {
        context = `\n\nCurrent note context:\nTitle: ${note.title}\nContent: ${note.content}`;
      }
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that helps users write and expand their notes.',
        },
        {
          role: 'user',
          content: prompt + context,
        },
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
    });

    const generatedContent = completion.choices[0]?.message?.content || 'Unable to generate content';

    res.status(200).json({ content: generatedContent });
  } catch (error) {
    next(error);
  }
};

export const findSimilarNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { noteId, limit = 5 } = req.body;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    // Generate embedding for the current note
    const embeddingResponse = await openai.embeddings.create({
      model: OPENAI_CONFIG.embeddingModel,
      input: `${note.title} ${note.content}`,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // For now, return similar notes based on tags (placeholder for vector similarity)
    const similarNotes = await prisma.note.findMany({
      where: {
        userId,
        id: { not: noteId },
        OR: [
          { tags: { hasSome: note.tags } },
          {
            content: {
              contains: note.title.split(' ')[0],
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ similarNotes, embedding: embedding.slice(0, 5) });
  } catch (error) {
    next(error);
  }
};

export const chatWithAI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, noteId, conversationHistory = [] } = req.body;

    let context = '';
    if (noteId) {
      const userId = req.user!.id;
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId },
      });

      if (note) {
        context = `\n\nYou are discussing this note:\nTitle: ${note.title}\nContent: ${note.content}`;
      }
    }

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful AI assistant for a note-taking application. Help users with their notes, answer questions, and provide insights.${context}`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages,
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};
