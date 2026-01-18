import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const getAllNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { folderId, tag } = req.query;

    const where: any = { userId };
    if (folderId) where.folderId = folderId as string;
    if (tag) where.tags = { has: tag as string };

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      include: {
        _count: {
          select: {
            attachments: true,
          },
        },
      },
    });

    res.status(200).json({ notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const note = await prisma.note.findFirst({
      where: { id: id as string, userId },
      include: {
        attachments: true,
      },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, content, folderId, tags } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        userId,
        folderId: folderId || null,
        tags: tags || [],
      },
    });

    res.status(201).json({ message: 'Note created successfully', note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, content, folderId, tags, isPinned } = req.body;

    const existingNote = await prisma.note.findFirst({
      where: { id: id as string, userId },
    });

    if (!existingNote) {
      throw new AppError(404, 'Note not found');
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const note = await prisma.note.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json({ message: 'Note updated successfully', note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const note = await prisma.note.findFirst({
      where: { id: id as string, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    await prisma.note.delete({ where: { id: id as string } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { q, folderId } = req.query;

    const searchQuery = q as string;
    const where: any = {
      userId,
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } },
      ],
    };

    if (folderId) where.folderId = folderId as string;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ notes, count: notes.length });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const uploadHandler = upload.single('file');
  
  uploadHandler(req, res, async (err: any) => {
    try {
      if (err) {
        return next(new AppError(400, err.message));
      }

      if (!req.file) {
        return next(new AppError(400, 'No file uploaded'));
      }

      const { id } = req.params;
      const userId = req.user!.id;

      const note = await prisma.note.findFirst({
        where: { id: id as string, userId },
      });

      if (!note) {
        throw new AppError(404, 'Note not found');
      }

      const attachment = await prisma.attachment.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          noteId: id as string,
        },
      });

      res.status(200).json({ message: 'File uploaded successfully', attachment });
    } catch (error) {
      next(error);
    }
  });
};

export const exportNoteToPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const note = await prisma.note.findFirst({
      where: { id: id as string, userId },
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    const doc = new PDFDocument();
    const filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text(note.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(note.content);
    doc.end();
  } catch (error) {
    next(error);
  }
};
