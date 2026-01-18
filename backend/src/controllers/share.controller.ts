import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const generateShareToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const createShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { noteId, permission, expiresAt } = req.body;

    const note = await prisma.note.findFirst({
      where: { id: noteId as string, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    const shareToken = generateShareToken();

    const share = await prisma.share.create({
      data: {
        noteId,
        userId,
        shareToken,
        permission,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;

    res.status(201).json({
      message: 'Share link created successfully',
      share,
      shareUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const getSharesByNoteId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { noteId } = req.params;

    const note = await prisma.note.findFirst({
      where: { id: noteId as string, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    const shares = await prisma.share.findMany({
      where: { noteId: noteId as string, userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ shares });
  } catch (error) {
    next(error);
  }
};

export const getShareById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const share = await prisma.share.findFirst({
      where: { id: id as string, userId },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    if (!share) {
      throw new AppError(404, 'Share not found');
    }

    res.status(200).json({ share });
  } catch (error) {
    next(error);
  }
};

export const updateShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { permission, expiresAt } = req.body;

    const existingShare = await prisma.share.findFirst({
      where: { id: id as string, userId },
    });

    if (!existingShare) {
      throw new AppError(404, 'Share not found');
    }

    const updateData: any = {};
    if (permission !== undefined) updateData.permission = permission;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const share = await prisma.share.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json({ message: 'Share updated successfully', share });
  } catch (error) {
    next(error);
  }
};

export const deleteShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const share = await prisma.share.findFirst({
      where: { id: id as string, userId },
    });

    if (!share) {
      throw new AppError(404, 'Share not found');
    }

    await prisma.share.delete({ where: { id: id as string } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSharedNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    const share = await prisma.share.findUnique({
      where: { shareToken: token as string },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!share) {
      throw new AppError(404, 'Share link not found or expired');
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      throw new AppError(410, 'Share link has expired');
    }

    await prisma.share.update({
      where: { id: share.id },
      data: { accessCount: { increment: 1 } },
    });

    res.status(200).json({
      note: share.note,
      permission: share.permission,
      sharedBy: share.user,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};
