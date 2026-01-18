import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useTheme } from 'vuetify';
import { STORAGE_KEYS } from '@/utils/constants';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

export const useUIStore = defineStore('ui', () => {
  const theme = useTheme();
  
  const isDarkMode = ref<boolean>(false);
  const sidebarOpen = ref<boolean>(true);
  const sidebarMini = ref<boolean>(false);
  const notifications = ref<Notification[]>([]);
  const isOffline = ref<boolean>(!navigator.onLine);
  const viewMode = ref<'grid' | 'list'>('grid');
  const editorFullscreen = ref<boolean>(false);
  const showAIAssistant = ref<boolean>(false);
  const commandPaletteOpen = ref<boolean>(false);

  const currentTheme = computed(() => (isDarkMode.value ? 'dark' : 'light'));

  const initializeUI = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') {
      isDarkMode.value = true;
      theme.global.name.value = 'dark';
    } else if (savedTheme === 'light') {
      isDarkMode.value = false;
      theme.global.name.value = 'light';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
      theme.global.name.value = prefersDark ? 'dark' : 'light';
    }

    const savedView = localStorage.getItem('view_mode') as 'grid' | 'list';
    if (savedView) {
      viewMode.value = savedView;
    }

    window.addEventListener('online', () => {
      isOffline.value = false;
      addNotification({
        message: 'Back online',
        type: 'success',
      });
    });

    window.addEventListener('offline', () => {
      isOffline.value = true;
      addNotification({
        message: 'You are offline',
        type: 'warning',
      });
    });
  };

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    theme.global.name.value = isDarkMode.value ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, theme.global.name.value);
  };

  const setTheme = (themeName: 'light' | 'dark' | 'auto') => {
    if (themeName === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
      theme.global.name.value = prefersDark ? 'dark' : 'light';
      localStorage.removeItem(STORAGE_KEYS.THEME);
    } else {
      isDarkMode.value = themeName === 'dark';
      theme.global.name.value = themeName;
      localStorage.setItem(STORAGE_KEYS.THEME, themeName);
    }
  };

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const toggleSidebarMini = () => {
    sidebarMini.value = !sidebarMini.value;
  };

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
    localStorage.setItem('view_mode', viewMode.value);
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    viewMode.value = mode;
    localStorage.setItem('view_mode', mode);
  };

  const toggleEditorFullscreen = () => {
    editorFullscreen.value = !editorFullscreen.value;
  };

  const toggleAIAssistant = () => {
    showAIAssistant.value = !showAIAssistant.value;
  };

  const toggleCommandPalette = () => {
    commandPaletteOpen.value = !commandPaletteOpen.value;
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      ...notification,
    };
    
    notifications.value.push(newNotification);

    const duration = notification.duration || 3000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  const showSuccess = (message: string, duration?: number) => {
    return addNotification({ message, type: 'success', duration });
  };

  const showError = (message: string, duration?: number) => {
    return addNotification({ message, type: 'error', duration });
  };

  const showWarning = (message: string, duration?: number) => {
    return addNotification({ message, type: 'warning', duration });
  };

  const showInfo = (message: string, duration?: number) => {
    return addNotification({ message, type: 'info', duration });
  };

  watch(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    (prefersDark) => {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (!savedTheme) {
        isDarkMode.value = prefersDark;
        theme.global.name.value = prefersDark ? 'dark' : 'light';
      }
    }
  );

  return {
    isDarkMode,
    sidebarOpen,
    sidebarMini,
    notifications,
    isOffline,
    viewMode,
    editorFullscreen,
    showAIAssistant,
    commandPaletteOpen,
    currentTheme,
    initializeUI,
    toggleTheme,
    setTheme,
    toggleSidebar,
    toggleSidebarMini,
    toggleViewMode,
    setViewMode,
    toggleEditorFullscreen,
    toggleAIAssistant,
    toggleCommandPalette,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});
