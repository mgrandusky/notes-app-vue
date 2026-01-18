# Notes App - Vue 3 + TypeScript Full-Stack Application

A modern, feature-rich note-taking application built with Vue 3, TypeScript, Node.js, and PostgreSQL. Includes 14 AI-powered features using OpenAI API for enhanced productivity.

## 🌟 Features

### Core Features
- ✅ **Full CRUD Operations** - Create, read, update, delete notes
- ✅ **Rich Text Editor** - TipTap with Markdown support
- ✅ **Tags & Organization** - Tag-based categorization and filtering
- ✅ **Search & Filter** - Advanced search with multiple criteria
- ✅ **Pin & Archive** - Organize notes by importance
- ✅ **File Attachments** - Upload and attach files to notes
- ✅ **Version History** - Track note changes over time
- ✅ **Real-time Collaboration** - WebSocket-powered live updates
- ✅ **PWA Support** - Installable as a desktop/mobile app
- ✅ **Dark Mode** - Toggle between light and dark themes

### Authentication & Security
- ✅ **OAuth 2.0** - Google and GitHub authentication
- ✅ **JWT Tokens** - Secure access and refresh tokens
- ✅ **Rate Limiting** - API and AI endpoint protection
- ✅ **Input Validation** - Zod-based request validation
- ✅ **Security Headers** - Helmet.js protection

### Sharing & Export
- ✅ **Share Notes** - Share with users or generate public links
- ✅ **Permission Levels** - View or edit access control
- ✅ **Expiring Links** - Time-limited share links
- ✅ **PDF Export** - Download notes as formatted PDFs
- ✅ **Multiple Formats** - Export to Markdown, HTML, plain text

### 🤖 AI-Powered Features (14 Total)
1. **AI Summarization** - Generate concise summaries of notes
2. **AI Tag Suggestions** - Automatic tag generation based on content
3. **Semantic Search** - Find notes using natural language queries
4. **Writing Assistant** - AI-powered content generation and expansion
5. **Sentiment Analysis** - Detect mood and emotion in notes
6. **Similar Notes** - Find related notes using embeddings
7. **Voice-to-Text** - Transcribe audio notes with Whisper API
8. **Text-to-Speech** - Listen to notes with voice playback
9. **AI Chat** - Ask questions about your notes
10. **Language Translation** - Translate notes to 50+ languages
11. **Grammar Check** - Advanced grammar and spell checking
12. **OCR** - Extract text from images with Vision API
13. **Note Templates** - AI-generated note templates
14. **Content Generation** - Brainstorm ideas and create outlines

## 🚀 Tech Stack

### Frontend
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Vite** for lightning-fast development
- **Pinia** for state management
- **Vue Router** for routing
- **Vuetify 3** for UI components
- **TipTap** for rich text editing
- **Axios** for API requests
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express
- **TypeScript** for type-safe backend code
- **PostgreSQL** database
- **Prisma ORM** for database management
- **Passport.js** for OAuth authentication
- **JWT** for token-based auth
- **Socket.io** for WebSocket support
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **OpenAI API** for AI features
- **Swagger** for API documentation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **pnpm**
- **OpenAI API Key** (for AI features)
- **Google OAuth Credentials** (optional)
- **GitHub OAuth Credentials** (optional)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mgrandusky/notes-app-vue.git
cd notes-app-vue
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Set DATABASE_URL, JWT secrets, OAuth credentials, OpenAI API key, etc.
nano .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with API URL and OAuth client IDs
nano .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🐳 Docker Installation (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mgrandusky/notes-app-vue.git
cd notes-app-vue

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your credentials
nano backend/.env
nano frontend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/notesapp

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=your-session-secret-min-32-chars
SESSION_MAX_AGE=86400000

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

## 📚 API Documentation

Once the backend is running, visit:

**Swagger UI**: `http://localhost:3000/api-docs`

## 🔑 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:5173`
4. Set Authorization callback URL: `http://localhost:3000/api/v1/auth/github/callback`
5. Copy Client ID and Client Secret to `.env`

## 📱 Usage

### Create an Account

1. Visit `http://localhost:5173`
2. Click "Sign Up" or use OAuth (Google/GitHub)
3. Create your first note!

### AI Features

Most AI features require an OpenAI API key:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to `backend/.env` as `OPENAI_API_KEY`
3. Restart the backend server

**AI Features Available:**
- Summarize notes
- Generate tags
- Semantic search
- Chat with AI about notes
- Grammar checking
- Content generation
- Voice-to-text transcription
- OCR from images
- And more!

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📦 Production Build

### Frontend

```bash
cd frontend
npm run build
# Output will be in dist/
```

### Backend

```bash
cd backend
npm run build
npm start
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Security Best Practices

1. **Never commit `.env` files**
2. **Use strong, unique secrets** for JWT and session
3. **Enable HTTPS** in production
4. **Keep dependencies updated**: `npm audit fix`
5. **Rate limit** API endpoints
6. **Validate all inputs** on backend
7. **Use environment-specific configs**

## 📂 Project Structure

```
notes-app-vue/
├── frontend/           # Vue 3 frontend application
│   ├── src/
│   │   ├── components/  # Reusable Vue components
│   │   ├── views/       # Page components
│   │   ├── stores/      # Pinia stores
│   │   ├── composables/ # Vue composables
│   │   ├── services/    # API services
│   │   └── router/      # Vue Router config
│   ├── public/          # Static assets
│   └── package.json
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   │   └── ai/      # AI service implementations
│   │   ├── middleware/  # Express middleware
│   │   ├── config/      # Configuration files
│   │   └── types/       # TypeScript types
│   ├── prisma/          # Database schema and migrations
│   └── package.json
├── docker-compose.yml   # Docker orchestration
└── README.md           # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/)
- [Prisma](https://www.prisma.io/)
- [OpenAI](https://openai.com/)
- [TipTap](https://tiptap.dev/)
- [Socket.io](https://socket.io/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [API Documentation](http://localhost:3000/api-docs)

## 🗺️ Roadmap

- [ ] Mobile app (React Native/Flutter)
- [ ] End-to-end encryption
- [ ] Advanced collaboration features
- [ ] Note templates marketplace
- [ ] Plugin system
- [ ] API rate limiting dashboard
- [ ] Analytics and insights

---

**Built with ❤️ using Vue 3, TypeScript, and AI**