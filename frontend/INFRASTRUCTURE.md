# Frontend Core Infrastructure Documentation

## 📁 Project Structure

```
frontend/src/
├── main.ts                 # Application entry point
├── App.vue                 # Root component
├── router/                 # Vue Router configuration
│   └── index.ts           # Routes and navigation guards
├── stores/                 # Pinia state management
│   ├── index.ts           # Store exports
│   ├── auth.ts            # Authentication store
│   ├── notes.ts           # Notes management store
│   ├── ai.ts              # AI features store
│   └── ui.ts              # UI state store
├── composables/            # Reusable composition functions
│   ├── useAuth.ts         # Authentication logic
│   ├── useNotes.ts        # Note operations
│   ├── useAI.ts           # AI feature integration
│   ├── useWebSocket.ts    # Real-time collaboration
│   ├── useDebounce.ts     # Debounce utility
│   ├── useKeyboardShortcuts.ts  # Keyboard shortcuts
│   └── useVoiceRecognition.ts   # Speech recognition
├── services/               # API service layer
│   ├── api.ts             # Axios instance with interceptors
│   ├── authService.ts     # Authentication API
│   ├── noteService.ts     # Note API
│   ├── shareService.ts    # Sharing API
│   └── aiService.ts       # AI API
├── types/                  # TypeScript type definitions
│   ├── note.types.ts      # Note-related types
│   ├── user.types.ts      # User types
│   ├── ai.types.ts        # AI feature types
│   └── api.types.ts       # API response types
├── plugins/                # Vue plugins
│   ├── vuetify.ts         # Vuetify configuration
│   └── pinia.ts           # Pinia setup
├── utils/                  # Utility functions
│   ├── validators.ts      # Form validation helpers
│   ├── formatters.ts      # Date, text formatting
│   ├── constants.ts       # App constants
│   └── aiHelpers.ts       # AI utility functions
└── views/                  # Page components
    ├── Login.vue
    ├── Register.vue
    ├── Notes.vue
    ├── NoteDetail.vue
    ├── Favorites.vue
    ├── Archive.vue
    ├── Shared.vue
    ├── Settings.vue
    ├── Profile.vue
    └── NotFound.vue
```

## 🎯 Core Features

### 1. **State Management (Pinia)**
- **Auth Store**: User authentication, session management, OAuth
- **Notes Store**: CRUD operations, filtering, search, favorites, archive
- **AI Store**: AI features (summarization, translation, chat, suggestions)
- **UI Store**: Theme, sidebar, notifications, view modes

### 2. **Composables (Composition API)**
All composables use Vue 3 Composition API with `<script setup>`:
- **useAuth**: Authentication wrapper with router integration
- **useNotes**: Note operations with automatic navigation
- **useAI**: AI feature access
- **useWebSocket**: Real-time collaboration via Socket.io
- **useDebounce**: Debounced functions and refs
- **useKeyboardShortcuts**: Global keyboard shortcut management
- **useVoiceRecognition**: Speech-to-text functionality

### 3. **Services (API Layer)**
Centralized API communication with:
- Axios interceptors for authentication
- Automatic token refresh
- Error handling
- Type-safe responses

### 4. **Router (Vue Router)**
- Authentication guards
- Route-based code splitting
- Protected routes
- Redirect handling
- Dynamic page titles

### 5. **Type System (TypeScript)**
Comprehensive type definitions for:
- Notes, Users, AI features
- API requests/responses
- Store state
- Component props

## 🚀 Getting Started

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📦 Key Dependencies

- **Vue 3.5**: Progressive JavaScript framework
- **Vuetify 3.11**: Material Design component library
- **Pinia 3.0**: State management
- **Vue Router 4.6**: Official router
- **Axios 1.13**: HTTP client
- **@tanstack/vue-query 5.92**: Data fetching and caching
- **Socket.io-client 4.8**: Real-time communication
- **TipTap 3.15**: Rich text editor
- **VeeValidate 4.15**: Form validation
- **Yup 1.7**: Schema validation
- **OpenAI 6.16**: AI integration

## 🎨 UI/UX Features

### Theme System
- Light/Dark mode with auto-detection
- Customizable color schemes
- Persistent theme preference
- Smooth transitions

### Notifications
- Toast notifications with types (success, error, warning, info)
- Auto-dismiss with configurable duration
- Action buttons support
- Queue management

### Offline Support
- PWA capabilities via vite-plugin-pwa
- Offline detection banner
- Service worker for caching
- Background sync

## 🔐 Authentication

### Features
- Email/Password authentication
- OAuth (Google, GitHub)
- JWT token management
- Automatic token refresh
- Persistent sessions
- Protected routes

### Usage Example
```typescript
import { useAuth } from '@/composables/useAuth';

const { login, logout, isAuthenticated, user } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'password' });

// Logout
await logout();
```

## 📝 Notes Management

### Features
- CRUD operations
- Search and filtering
- Tags management
- Pin/Favorite/Archive
- Real-time collaboration
- Version history
- File attachments
- Export (PDF, Markdown, HTML)

### Usage Example
```typescript
import { useNotes } from '@/composables/useNotes';

const { notes, createNote, updateNote, deleteNote } = useNotes();

// Create note
const note = await createNote({
  title: 'New Note',
  content: 'Content here',
  tags: ['work', 'important']
});

// Update note
await updateNote(note.id, { title: 'Updated Title' });
```

## 🤖 AI Features

### Capabilities
- Text summarization (short, medium, long)
- Language translation
- AI chat with context
- Tag suggestions
- Writing improvements
- Content generation
- Sentiment analysis
- Voice transcription

### Usage Example
```typescript
import { useAI } from '@/composables/useAI';

const { summarizeNote, translateNote, sendChatMessage } = useAI();

// Summarize
const summary = await summarizeNote(noteId, 'medium');

// Translate
const translation = await translateNote(noteId, 'es');

// Chat
const response = await sendChatMessage('Help me improve this note');
```

## ⌨️ Keyboard Shortcuts

Default shortcuts:
- `Ctrl+N` - New note
- `Ctrl+S` - Save note
- `Ctrl+K` - Search
- `Ctrl+B` - Toggle sidebar
- `Ctrl+D` - Toggle favorite
- `Ctrl+P` - Toggle pin
- `Ctrl+E` - Archive note
- `Ctrl+I` - AI chat
- `Delete` - Delete note

## 🔄 Real-time Collaboration

### Features
- Live cursor positions
- Collaborative editing
- User presence
- Conflict resolution
- Auto-sync

### Usage Example
```typescript
import { useWebSocket } from '@/composables/useWebSocket';

const { connect, joinNote, sendNoteUpdate, onNoteUpdate } = useWebSocket();

// Connect
connect(accessToken);

// Join note for collaboration
joinNote(noteId);

// Listen for updates
onNoteUpdate((update) => {
  // Handle note update
});
```

## 🎤 Voice Recognition

### Features
- Speech-to-text
- Continuous recognition
- Multiple languages
- Interim results
- Browser API wrapper

### Usage Example
```typescript
import { useVoiceRecognition } from '@/composables/useVoiceRecognition';

const { isSupported, start, stop, transcript } = useVoiceRecognition();

if (isSupported.value) {
  start(); // Start recording
  // transcript.value updates in real-time
  stop(); // Stop recording
}
```

## 🛠️ Utilities

### Validators
- Email validation
- Password strength checker
- Form schemas (login, register, profile, etc.)
- Yup integration

### Formatters
- Date formatting (short, long, relative)
- File size formatting
- Text truncation
- HTML stripping
- Number formatting

### Constants
- API URLs
- Storage keys
- Routes
- Colors
- Debounce delays
- Query keys
- Keyboard shortcuts
- File upload limits

## 🏗️ Architecture Patterns

### Composition API
All components use `<script setup>` syntax for cleaner, more maintainable code.

### Store Pattern
Pinia stores follow a consistent structure:
- Reactive state with `ref()`
- Computed getters with `computed()`
- Actions for business logic
- TypeScript types for state

### Service Layer
Services abstract API calls:
- Single source of truth for endpoints
- Type-safe responses
- Centralized error handling
- Reusable across components

### Type-First Development
All data structures have TypeScript types:
- Better IDE support
- Compile-time error detection
- Self-documenting code
- Safer refactoring

## 📚 Best Practices

1. **Use composables** for reusable logic
2. **Use stores** for global state
3. **Use services** for API calls
4. **Type everything** in TypeScript
5. **Validate user input** with schemas
6. **Handle errors** gracefully
7. **Debounce** expensive operations
8. **Use route guards** for protection
9. **Keep components small** and focused
10. **Document complex logic** with comments

## 🔍 Code Examples

### Creating a New Composable
```typescript
import { ref } from 'vue';

export const useMyFeature = () => {
  const state = ref<string>('');
  const loading = ref(false);

  const doSomething = async () => {
    loading.value = true;
    try {
      // Your logic here
    } finally {
      loading.value = false;
    }
  };

  return {
    state,
    loading,
    doSomething,
  };
};
```

### Adding a New Store
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyStore = defineStore('myStore', () => {
  const items = ref<Item[]>([]);
  
  const totalItems = computed(() => items.value.length);
  
  const addItem = (item: Item) => {
    items.value.push(item);
  };

  return { items, totalItems, addItem };
});
```

## 🐛 Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run build`

### Runtime Errors
- Check browser console for errors
- Verify API_BASE_URL in `.env`
- Check network tab for failed requests
- Ensure backend is running

### Type Errors
- Update type definitions in `types/` directory
- Check import paths use `@/` alias
- Verify all interfaces are exported

## 📄 License

This project infrastructure is part of the Notes App Vue application.
