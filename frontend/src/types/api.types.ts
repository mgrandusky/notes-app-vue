export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WebSocketMessage {
  type: 'note.update' | 'note.delete' | 'note.share' | 'user.online' | 'user.offline' | 'cursor.move';
  payload: unknown;
  timestamp: string;
}

export interface WebSocketCursorUpdate {
  noteId: string;
  userId: string;
  userName: string;
  position: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface WebSocketNoteUpdate {
  noteId: string;
  userId: string;
  changes: {
    type: 'insert' | 'delete' | 'replace';
    position: number;
    content: string;
  };
  version: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
