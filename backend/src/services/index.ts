/**
 * Services Index
 * Central export point for all application services
 */

// AI Services (re-export from ai/index.ts)
export * from './ai';

// Infrastructure Services
export {
  websocketService,
  WebSocketService,
  type CollaborationEvents,
  type NoteUpdateData,
  type CursorData,
  type SelectionData,
  type TypingData,
  type ConnectedUser
} from './websocketService';

export {
  uploadService,
  UploadService,
  type UploadOptions,
  type UploadedFileInfo
} from './uploadService';

export {
  pdfService,
  PDFService,
  type PDFOptions,
  type NotePDFOptions,
  type PDFResult
} from './pdfService';

export {
  emailService,
  EmailService,
  type EmailOptions,
  type EmailTemplate,
  type EmailTemplateData,
  type EmailResult
} from './emailService';
