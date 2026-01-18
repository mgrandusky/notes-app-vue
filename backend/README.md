# Backend - Notes App API

Backend API for the Notes App built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Features

- **Authentication & Authorization**
  - Local authentication (email/password)
  - OAuth (Google, GitHub)
  - JWT-based authentication
  - Role-based access control (RBAC)

- **Notes Management**
  - Create, read, update, delete notes
  - Rich text content support
  - Tags and categorization
  - Pin, archive, and trash functionality
  - Note versioning and history

- **Collaboration**
  - Share notes with other users
  - View and edit permissions
  - Real-time collaboration with WebSocket

- **AI Integration**
  - AI-powered note suggestions
  - Semantic search with embeddings
  - Chat interface for note interactions

- **File Management**
  - File upload support
  - Attachment management
  - PDF generation

- **Security**
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Password hashing with bcrypt

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js, JWT
- **WebSocket**: Socket.io
- **Validation**: Zod
- **AI**: OpenAI API
- **Email**: Nodemailer
- **Documentation**: Swagger

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:push` - Push schema changes to database

## Project Structure

```
backend/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   └── ai/          # AI service integration
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── fixtures/        # Test fixtures
└── uploads/             # File upload directory
```

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **Note**: Note content and metadata
- **SharedNote**: Note sharing and permissions
- **NoteVersion**: Note version history
- **Attachment**: File attachments
- **NoteEmbedding**: AI embeddings for semantic search
- **ChatMessage**: AI chat history

## License

ISC
