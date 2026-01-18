import api from './api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';
import type { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  NoteFilter,
  NoteVersion,
  Attachment 
} from '@/types/note.types';

export const noteService = {
  async getNotes(filter?: NoteFilter, pagination?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>('/notes', {
      params: { ...filter, ...pagination },
    });
    return response.data.data;
  },

  async getNoteById(id: string): Promise<Note> {
    const response = await api.get<ApiResponse<Note>>(`/notes/${id}`);
    return response.data.data;
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>('/notes', data);
    return response.data.data;
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${id}`, data);
    return response.data.data;
  },

  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async togglePin(id: string): Promise<Note> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${id}/pin`);
    return response.data.data;
  },

  async toggleFavorite(id: string): Promise<Note> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${id}/favorite`);
    return response.data.data;
  },

  async toggleArchive(id: string): Promise<Note> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${id}/archive`);
    return response.data.data;
  },

  async duplicateNote(id: string): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>(`/notes/${id}/duplicate`);
    return response.data.data;
  },

  async searchNotes(query: string, pagination?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>('/notes/search', {
      params: { q: query, ...pagination },
    });
    return response.data.data;
  },

  async getFavoriteNotes(pagination?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>('/notes/favorites', {
      params: pagination,
    });
    return response.data.data;
  },

  async getArchivedNotes(pagination?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>('/notes/archived', {
      params: pagination,
    });
    return response.data.data;
  },

  async getTags(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/notes/tags');
    return response.data.data;
  },

  async getNoteVersions(id: string): Promise<NoteVersion[]> {
    const response = await api.get<ApiResponse<NoteVersion[]>>(`/notes/${id}/versions`);
    return response.data.data;
  },

  async restoreVersion(noteId: string, versionId: string): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>(`/notes/${noteId}/versions/${versionId}/restore`);
    return response.data.data;
  },

  async uploadAttachment(noteId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<Attachment>>(
      `/notes/${noteId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async deleteAttachment(noteId: string, attachmentId: string): Promise<void> {
    await api.delete(`/notes/${noteId}/attachments/${attachmentId}`);
  },

  async exportNote(id: string, format: 'pdf' | 'markdown' | 'html'): Promise<Blob> {
    const response = await api.get(`/notes/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async importNotes(file: File): Promise<Note[]> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<Note[]>>('/notes/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
