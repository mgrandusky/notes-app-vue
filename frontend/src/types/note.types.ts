export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  sharedWith?: SharedUser[];
  attachments?: Attachment[];
  version?: number;
}

export interface SharedUser {
  userId: string;
  email: string;
  permission: 'view' | 'edit';
  sharedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface NoteFilter {
  search?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
  color?: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  color?: string;
}

export interface ShareNoteDto {
  noteId: string;
  userEmail: string;
  permission: 'view' | 'edit';
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  title: string;
  createdAt: string;
  createdBy: string;
}

export interface NoteCollaborator {
  userId: string;
  name: string;
  email: string;
  isOnline: boolean;
  cursorPosition?: number;
}
