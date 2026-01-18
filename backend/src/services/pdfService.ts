import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * PDF generation options
 */
export interface PDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  fontSize?: number;
  font?: 'Helvetica' | 'Times-Roman' | 'Courier';
}

/**
 * Note PDF export options
 */
export interface NotePDFOptions extends PDFOptions {
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  headerColor?: string;
  footerText?: string;
}

/**
 * PDF generation result
 */
export interface PDFResult {
  buffer?: Buffer;
  path?: string;
  size: number;
}

/**
 * PDF Export Service using PDFKit
 * Generate PDF documents from notes and other content
 */
export class PDFService {
  /**
   * Generate PDF from note content
   * @param noteData - Note data to export
   * @param options - PDF options
   * @returns Promise<PDFResult>
   */
  async generateNotePDF(
    noteData: {
      title: string;
      content: string;
      createdAt?: Date;
      updatedAt?: Date;
      author?: string;
      tags?: string[];
    },
    options: NotePDFOptions = {}
  ): Promise<PDFResult> {
    const {
      includeMetadata = true,
      includeTimestamps = true,
      headerColor = '#2c3e50',
      footerText,
      margins = { top: 72, bottom: 72, left: 72, right: 72 },
      fontSize = 12,
      font = 'Helvetica'
    } = options;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: margins.top || 72,
            bottom: margins.bottom || 72,
            left: margins.left || 72,
            right: margins.right || 72
          },
          info: {
            Title: noteData.title,
            Author: noteData.author || options.author || 'Notes App',
            Subject: options.subject || 'Note Export',
            Keywords: options.keywords?.join(', ') || noteData.tags?.join(', ')
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            size: buffer.length
          });
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(24)
           .fillColor(headerColor)
           .text(noteData.title, { align: 'left' });
        
        doc.moveDown(0.5);
        
        // Metadata section
        if (includeMetadata) {
          doc.fontSize(10)
             .fillColor('#7f8c8d');
          
          if (noteData.author) {
            doc.text(`Author: ${noteData.author}`);
          }
          
          if (includeTimestamps) {
            if (noteData.createdAt) {
              doc.text(`Created: ${this.formatDate(noteData.createdAt)}`);
            }
            if (noteData.updatedAt) {
              doc.text(`Updated: ${this.formatDate(noteData.updatedAt)}`);
            }
          }
          
          if (noteData.tags && noteData.tags.length > 0) {
            doc.text(`Tags: ${noteData.tags.join(', ')}`);
          }
          
          doc.moveDown(1);
        }

        // Divider line
        doc.strokeColor(headerColor)
           .lineWidth(1)
           .moveTo(doc.page.margins.left, doc.y)
           .lineTo(doc.page.width - doc.page.margins.right, doc.y)
           .stroke();
        
        doc.moveDown(1);

        // Content
        doc.fontSize(fontSize)
           .fillColor('#000000')
           .font(font)
           .text(noteData.content, {
             align: 'justify',
             lineGap: 5
           });

        // Footer
        if (footerText) {
          const pageCount = doc.bufferedPageRange().count;
          for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(9)
               .fillColor('#95a5a6')
               .text(
                 `${footerText} | Page ${i + 1} of ${pageCount}`,
                 doc.page.margins.left,
                 doc.page.height - doc.page.margins.bottom + 20,
                 { align: 'center' }
               );
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDF from multiple notes
   * @param notes - Array of notes
   * @param options - PDF options
   * @returns Promise<PDFResult>
   */
  async generateMultiNotePDF(
    notes: Array<{
      title: string;
      content: string;
      createdAt?: Date;
      updatedAt?: Date;
      author?: string;
    }>,
    options: NotePDFOptions = {}
  ): Promise<PDFResult> {
    const { margins = { top: 72, bottom: 72, left: 72, right: 72 } } = options;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: margins.top || 72,
            bottom: margins.bottom || 72,
            left: margins.left || 72,
            right: margins.right || 72
          },
          info: {
            Title: options.title || 'Notes Export',
            Author: options.author || 'Notes App',
            Subject: options.subject || 'Multiple Notes Export'
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            size: buffer.length
          });
        });
        doc.on('error', reject);

        // Title page
        doc.fontSize(32)
           .fillColor('#2c3e50')
           .text(options.title || 'Notes Collection', { align: 'center' });
        
        doc.moveDown(2);
        doc.fontSize(12)
           .fillColor('#7f8c8d')
           .text(`Total Notes: ${notes.length}`, { align: 'center' });
        doc.text(`Generated: ${this.formatDate(new Date())}`, { align: 'center' });

        // Process each note
        notes.forEach((note, index) => {
          doc.addPage();
          
          // Note title
          doc.fontSize(20)
             .fillColor('#2c3e50')
             .text(note.title);
          
          doc.moveDown(0.5);
          
          // Metadata
          doc.fontSize(10)
             .fillColor('#7f8c8d');
          
          if (note.author) {
            doc.text(`Author: ${note.author}`);
          }
          if (note.createdAt) {
            doc.text(`Created: ${this.formatDate(note.createdAt)}`);
          }
          
          doc.moveDown(1);
          
          // Divider
          doc.strokeColor('#2c3e50')
             .lineWidth(1)
             .moveTo(doc.page.margins.left, doc.y)
             .lineTo(doc.page.width - doc.page.margins.right, doc.y)
             .stroke();
          
          doc.moveDown(1);
          
          // Content
          doc.fontSize(12)
             .fillColor('#000000')
             .text(note.content, {
               align: 'justify',
               lineGap: 5
             });
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Save PDF to file
   * @param pdfResult - PDF result with buffer
   * @param filePath - Destination file path
   * @returns Promise<string>
   */
  async savePDFToFile(pdfResult: PDFResult, filePath: string): Promise<string> {
    if (!pdfResult.buffer) {
      throw new Error('PDF buffer is required');
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, pdfResult.buffer!, (err) => {
        if (err) reject(err);
        else resolve(filePath);
      });
    });
  }

  /**
   * Create PDF stream
   * @param content - Content to write to PDF
   * @param options - PDF options
   * @returns Readable stream
   */
  createPDFStream(content: string, options: PDFOptions = {}): Readable {
    const doc = new PDFDocument({
      size: 'A4',
      margins: options.margins || { top: 72, bottom: 72, left: 72, right: 72 }
    });

    // Write content
    doc.fontSize(options.fontSize || 12)
       .font(options.font || 'Helvetica')
       .text(content);

    doc.end();

    return doc;
  }

  /**
   * Generate table of contents PDF
   * @param items - TOC items
   * @param options - PDF options
   */
  async generateTOCPDF(
    items: Array<{ title: string; page?: number; level?: number }>,
    options: PDFOptions = {}
  ): Promise<PDFResult> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4' });
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, size: buffer.length });
        });
        doc.on('error', reject);

        // Title
        doc.fontSize(24)
           .fillColor('#2c3e50')
           .text('Table of Contents', { align: 'center' });
        
        doc.moveDown(2);

        // TOC items
        items.forEach((item, index) => {
          const indent = (item.level || 0) * 20;
          const fontSize = 14 - (item.level || 0) * 2;
          
          doc.fontSize(fontSize)
             .fillColor('#000000')
             .text(
               `${item.title}${item.page ? ` .................. ${item.page}` : ''}`,
               doc.page.margins.left + indent
             );
          
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add watermark to PDF
   * @param pdfBuffer - Original PDF buffer
   * @param watermarkText - Watermark text
   * @returns Promise<Buffer>
   */
  async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    // Note: This is a simplified watermark implementation
    // For production, consider using pdf-lib or similar for more advanced features
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(60)
           .fillColor('#cccccc', 0.3)
           .rotate(-45, { origin: [300, 400] })
           .text(watermarkText, 100, 400);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Format date for PDF display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Estimate PDF size before generation
   * @param contentLength - Length of content in characters
   * @returns Estimated size in bytes
   */
  estimatePDFSize(contentLength: number): number {
    // Rough estimation: ~3 bytes per character + overhead
    const baseOverhead = 5000; // Base PDF structure
    const contentSize = contentLength * 3;
    return baseOverhead + contentSize;
  }

  /**
   * Validate content for PDF generation
   * @param content - Content to validate
   * @returns Validation result
   */
  validateContent(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }

    if (content.length > 1000000) {
      errors.push('Content exceeds maximum length (1MB)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Singleton instance
export const pdfService = new PDFService();
