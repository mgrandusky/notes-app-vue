import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { apiLimiter } from '../middleware/rateLimiter';
import * as shareController from '../controllers/share.controller';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createShareSchema = z.object({
  body: z.object({
    noteId: z.string().uuid('Invalid note ID'),
    permission: z.enum(['VIEW', 'EDIT']),
    expiresAt: z.string().datetime().optional(),
  }),
});

const shareIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid share ID'),
  }),
});

const shareTokenSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Share token is required'),
  }),
});

const updateShareSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid share ID'),
  }),
  body: z.object({
    permission: z.enum(['VIEW', 'EDIT']).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  }),
});

/**
 * @swagger
 * /share:
 *   post:
 *     summary: Create a share link for a note
 *     tags: [Sharing]
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
 *               - permission
 *             properties:
 *               noteId:
 *                 type: string
 *                 format: uuid
 *               permission:
 *                 type: string
 *                 enum: [view, edit]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Share link created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, apiLimiter, validate(createShareSchema), shareController.createShare);

/**
 * @swagger
 * /share/note/{noteId}:
 *   get:
 *     summary: Get all shares for a specific note
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shares
 */
router.get('/note/:noteId', authenticateToken, apiLimiter, shareController.getSharesByNoteId);

/**
 * @swagger
 * /share/{id}:
 *   get:
 *     summary: Get share details by ID
 *     tags: [Sharing]
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
 *         description: Share details
 */
router.get('/:id', authenticateToken, apiLimiter, validate(shareIdSchema), shareController.getShareById);

/**
 * @swagger
 * /share/{id}:
 *   put:
 *     summary: Update share settings
 *     tags: [Sharing]
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
 *               permission:
 *                 type: string
 *                 enum: [view, edit]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Share updated
 */
router.put('/:id', authenticateToken, apiLimiter, validate(updateShareSchema), shareController.updateShare);

/**
 * @swagger
 * /share/{id}:
 *   delete:
 *     summary: Revoke a share link
 *     tags: [Sharing]
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
 *         description: Share revoked
 */
router.delete('/:id', authenticateToken, apiLimiter, validate(shareIdSchema), shareController.deleteShare);

/**
 * @swagger
 * /share/public/{token}:
 *   get:
 *     summary: Access shared note via public token
 *     tags: [Sharing]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared note content
 *       404:
 *         description: Share not found or expired
 */
router.get('/public/:token', optionalAuth, apiLimiter, validate(shareTokenSchema), shareController.getSharedNote);

export default router;
