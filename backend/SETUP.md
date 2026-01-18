# Backend Setup Guide

Complete guide to set up and run the Notes App backend.

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)

## Quick Start

### 1. Automated Setup (Recommended)

Run the setup script:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Manual Setup

#### Install Dependencies

```bash
npm install
```

#### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update the following required values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/notes_app?schema=public"

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
SESSION_SECRET=your-super-secret-session-key-min-32-characters

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# OAuth (optional, for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

#### Create Required Directories

```bash
mkdir -p uploads
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

## API Documentation

Once the server is running, visit:

**Swagger UI**: http://localhost:3000/api-docs

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Push schema changes (development only)
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Create New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

## OAuth Setup (Optional)

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
3. Set Authorization callback URL: `http://localhost:3000/api/v1/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Email Configuration (Optional)

For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Update `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d notes_app

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
```

### Port Already in Use

Change the port in `.env`:

```env
PORT=3001
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### OpenAI API Issues

- Verify API key is valid
- Check account has credits
- Ensure API key has proper permissions

## Project Structure

```
backend/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   └── ai/          # AI services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server startup
│   └── index.ts         # Entry point
├── tests/               # Test files
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── uploads/             # File uploads
├── .env                 # Environment variables
├── tsconfig.json        # TypeScript config
└── package.json
```

## Environment Variables Reference

See `.env.example` for complete list with descriptions.

## Security Best Practices

1. **Never commit `.env` file**
2. **Use strong secrets** (min 32 characters)
3. **Rotate JWT secrets** regularly in production
4. **Enable HTTPS** in production
5. **Use environment-specific configs**
6. **Keep dependencies updated**

## Production Deployment

### Environment Setup

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=strong-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Build and Deploy

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

### Recommended Hosting

- **API**: Railway, Render, Heroku, AWS, DigitalOcean
- **Database**: Neon, Supabase, AWS RDS, Railway
- **Process Manager**: PM2 for Node.js

## Support

For issues or questions:
- Check existing issues
- Review API documentation
- Check logs in development mode

## License

ISC
