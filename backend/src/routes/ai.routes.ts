import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { aiLimiter } from '../middleware/rateLimiter';
import * as aiController from '../controllers/ai.controller';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const summarizeSchema = z.object({
  body: z.object({
    noteId: z.string().uuid('Invalid note ID'),
  }),
});

const suggestTagsSchema = z.object({
  body: z.object({
    noteId: z.string().uuid('Invalid note ID'),
  }),
});

const generateContentSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
    noteId: z.string().uuid().optional(),
  }),
});

const similarNotesSchema = z.object({
  body: z.object({
    noteId: z.string().uuid('Invalid note ID'),
    limit: z.number().int().min(1).max(10).optional(),
  }),
});

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
    noteId: z.string().uuid().optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
  }),
});

/**
 * @swagger
 * /ai/summarize:
 *   post:
 *     summary: Generate AI summary of a note
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Summary generated
 *       401:
 *         description: Unauthorized
 */
router.post('/summarize', aiLimiter, validate(summarizeSchema), aiController.summarizeNote);

/**
 * @swagger
 * /ai/suggest-tags:
 *   post:
 *     summary: Get AI-suggested tags for a note
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Tags suggested
 */
router.post('/suggest-tags', aiLimiter, validate(suggestTagsSchema), aiController.suggestTags);

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     summary: Generate content using AI
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *               noteId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Content generated
 */
router.post('/generate', aiLimiter, validate(generateContentSchema), aiController.generateContent);

/**
 * @swagger
 * /ai/similar-notes:
 *   post:
 *     summary: Find similar notes using AI embeddings
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: string
 *                 format: uuid
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Similar notes found
 */
router.post('/similar-notes', aiLimiter, validate(similarNotesSchema), aiController.findSimilarNotes);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI about notes
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               noteId:
 *                 type: string
 *                 format: uuid
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', aiLimiter, validate(chatSchema), aiController.chatWithAI);

export default router;
