import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter';
import * as noteController from '../controllers/note.controller';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: z.string().default(''),
    folderId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    folderId: z.string().uuid().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
  }),
});

const noteIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid note ID'),
  }),
});

const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    folderId: z.string().uuid().optional(),
  }),
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes for authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *         description: Filter by folder ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Unauthorized
 */
router.get('/', apiLimiter, noteController.getAllNotes);

/**
 * @swagger
 * /notes/search:
 *   get:
 *     summary: Search notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', apiLimiter, validate(searchSchema), noteController.searchNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a specific note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note details
 *       404:
 *         description: Note not found
 */
router.get('/:id', apiLimiter, validate(noteIdSchema), noteController.getNoteById);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               folderId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Note created
 */
router.post('/', apiLimiter, validate(createNoteSchema), noteController.createNote);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               folderId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Note updated
 */
router.put('/:id', apiLimiter, validate(updateNoteSchema), noteController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Note deleted
 */
router.delete('/:id', apiLimiter, validate(noteIdSchema), noteController.deleteNote);

/**
 * @swagger
 * /notes/{id}/upload:
 *   post:
 *     summary: Upload attachment to note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded
 */
router.post('/:id/upload', uploadLimiter, validate(noteIdSchema), noteController.uploadAttachment);

/**
 * @swagger
 * /notes/{id}/export:
 *   get:
 *     summary: Export note as PDF
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file
 */
router.get('/:id/export', apiLimiter, validate(noteIdSchema), noteController.exportNoteToPDF);

export default router;
