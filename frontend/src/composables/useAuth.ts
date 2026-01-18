import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { LoginDto, RegisterDto, UpdateProfileDto, UpdatePasswordDto } from '@/types/user.types';

export const useAuth = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading, error, userInitials } = storeToRefs(authStore);

  const login = async (credentials: LoginDto) => {
    try {
      await authStore.login(credentials);
      router.push('/notes');
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      await authStore.register(userData);
      router.push('/notes');
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authStore.logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    return authStore.updateProfile(data);
  };

  const updatePassword = async (data: UpdatePasswordDto) => {
    return authStore.updatePassword(data);
  };

  const googleLogin = async (code: string) => {
    try {
      await authStore.googleLogin(code);
      router.push('/notes');
    } catch (err) {
      throw err;
    }
  };

  const githubLogin = async (code: string) => {
    try {
      await authStore.githubLogin(code);
      router.push('/notes');
    } catch (err) {
      throw err;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    userInitials,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    googleLogin,
    githubLogin,
  };
};
