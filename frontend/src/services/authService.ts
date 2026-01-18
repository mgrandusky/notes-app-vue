import api from './api';
import type { ApiResponse } from '@/types/api.types';
import type { 
  User, 
  AuthTokens, 
  LoginDto, 
  RegisterDto, 
  ResetPasswordDto,
  UpdatePasswordDto,
  UpdateProfileDto 
} from '@/types/user.types';

export const authService = {
  async login(credentials: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  async register(userData: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/register',
      userData
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },

  async updatePassword(data: UpdatePasswordDto): Promise<void> {
    await api.post('/auth/change-password', data);
  },

  async requestPasswordReset(data: ResetPasswordDto): Promise<void> {
    await api.post('/auth/forgot-password', data);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async googleAuth(code: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/google',
      { code }
    );
    return response.data.data;
  },

  async githubAuth(code: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/github',
      { code }
    );
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  },
};
