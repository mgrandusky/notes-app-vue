export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'local' | 'google' | 'github';
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'grid' | 'list';
  notificationsEnabled: boolean;
  autoSave: boolean;
  editorFontSize: number;
  language: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OAuthProvider {
  name: 'google' | 'github';
  clientId: string;
  redirectUri: string;
}

export interface ResetPasswordDto {
  email: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}
