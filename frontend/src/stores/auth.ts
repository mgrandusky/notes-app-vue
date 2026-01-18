import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { STORAGE_KEYS } from '@/utils/constants';
import type { User, LoginDto, RegisterDto, UpdateProfileDto, UpdatePasswordDto } from '@/types/user.types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const userInitials = computed(() => {
    if (!user.value) return '';
    return user.value.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  });

  const initializeAuth = () => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (storedUser && storedAccessToken) {
      user.value = JSON.parse(storedUser);
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken;
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      
      user.value = response.user;
      accessToken.value = response.tokens.accessToken;
      refreshToken.value = response.tokens.refreshToken;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);

      return response.user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.register(userData);
      
      user.value = response.user;
      accessToken.value = response.tokens.accessToken;
      refreshToken.value = response.tokens.refreshToken;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);

      return response.user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      isLoading.value = true;
      const currentUser = await authService.getCurrentUser();
      user.value = currentUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      return currentUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await authService.updateProfile(data);
      user.value = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePassword = async (data: UpdatePasswordDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      await authService.updatePassword(data);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update password';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const googleLogin = async (code: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.googleAuth(code);
      
      user.value = response.user;
      accessToken.value = response.tokens.accessToken;
      refreshToken.value = response.tokens.refreshToken;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);

      return response.user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const githubLogin = async (code: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.githubAuth(code);
      
      user.value = response.user;
      accessToken.value = response.tokens.accessToken;
      refreshToken.value = response.tokens.refreshToken;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);

      return response.user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'GitHub login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    userInitials,
    initializeAuth,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    updatePassword,
    googleLogin,
    githubLogin,
  };
});
