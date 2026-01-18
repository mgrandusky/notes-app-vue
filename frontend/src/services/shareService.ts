import api from './api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';
import type { Note, ShareNoteDto, SharedUser } from '@/types/note.types';

export const shareService = {
  async shareNote(data: ShareNoteDto): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>(`/notes/${data.noteId}/share`, {
      userEmail: data.userEmail,
      permission: data.permission,
    });
    return response.data.data;
  },

  async unshareNote(noteId: string, userId: string): Promise<Note> {
    const response = await api.delete<ApiResponse<Note>>(`/notes/${noteId}/share/${userId}`);
    return response.data.data;
  },

  async updateSharePermission(
    noteId: string,
    userId: string,
    permission: 'view' | 'edit'
  ): Promise<Note> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${noteId}/share/${userId}`, {
      permission,
    });
    return response.data.data;
  },

  async getSharedNotes(pagination?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>('/notes/shared', {
      params: pagination,
    });
    return response.data.data;
  },

  async getSharedUsers(noteId: string): Promise<SharedUser[]> {
    const response = await api.get<ApiResponse<SharedUser[]>>(`/notes/${noteId}/shared-users`);
    return response.data.data;
  },

  async createShareLink(noteId: string, expiresIn?: number): Promise<{ link: string; expiresAt: string }> {
    const response = await api.post<ApiResponse<{ link: string; expiresAt: string }>>(
      `/notes/${noteId}/share-link`,
      { expiresIn }
    );
    return response.data.data;
  },

  async revokeShareLink(noteId: string): Promise<void> {
    await api.delete(`/notes/${noteId}/share-link`);
  },

  async getSharedNoteByLink(shareToken: string): Promise<Note> {
    const response = await api.get<ApiResponse<Note>>(`/shared/${shareToken}`);
    return response.data.data;
  },

  async acceptShareInvite(noteId: string, inviteToken: string): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>(`/notes/${noteId}/accept-invite`, {
      inviteToken,
    });
    return response.data.data;
  },

  async declineShareInvite(noteId: string, inviteToken: string): Promise<void> {
    await api.post(`/notes/${noteId}/decline-invite`, { inviteToken });
  },
};
