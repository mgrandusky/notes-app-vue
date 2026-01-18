export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  PREFERENCES: 'preferences',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  NOTES: '/notes',
  NOTE_DETAIL: '/notes/:id',
  FAVORITES: '/favorites',
  ARCHIVE: '/archive',
  SHARED: '/shared',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export const NOTE_COLORS = [
  '#ffffff',
  '#f28b82',
  '#fbbc04',
  '#fff475',
  '#ccff90',
  '#a7ffeb',
  '#cbf0f8',
  '#aecbfa',
  '#d7aefb',
  '#fdcfe8',
  '#e6c9a8',
  '#e8eaed',
] as const;

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  AUTO_SAVE: 1000,
  TYPING: 500,
} as const;

export const QUERY_KEYS = {
  NOTES: 'notes',
  NOTE: 'note',
  SHARED_NOTES: 'shared-notes',
  USER: 'user',
  TAGS: 'tags',
} as const;

export const AI_FEATURES = {
  SUMMARIZE: 'summarize',
  TRANSLATE: 'translate',
  CHAT: 'chat',
  SUGGEST_TAGS: 'suggest-tags',
  IMPROVE_WRITING: 'improve-writing',
  GENERATE: 'generate',
  ANALYZE: 'analyze',
} as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
] as const;

export const KEYBOARD_SHORTCUTS = {
  NEW_NOTE: 'ctrl+n',
  SAVE_NOTE: 'ctrl+s',
  SEARCH: 'ctrl+k',
  TOGGLE_SIDEBAR: 'ctrl+b',
  TOGGLE_FAVORITE: 'ctrl+d',
  TOGGLE_PIN: 'ctrl+p',
  DELETE_NOTE: 'delete',
  ARCHIVE_NOTE: 'ctrl+e',
  AI_CHAT: 'ctrl+i',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const NOTIFICATION_DURATION = 3000;
export const AUTO_SAVE_INTERVAL = 5000;
export const WEBSOCKET_RECONNECT_INTERVAL = 3000;
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
