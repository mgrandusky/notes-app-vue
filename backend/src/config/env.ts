import { z } from 'zod';

const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_VERSION: z.string().default('v1'),

  // Database Configuration
  DATABASE_URL: z.string().url(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Session Configuration
  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z.string().default('86400000').transform(Number),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),

  // OAuth - GitHub
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string().url(),

  // Frontend URL
  FRONTEND_URL: z.string().url(),

  // Email Configuration
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().default('587').transform(Number),
  EMAIL_SECURE: z.string().default('false').transform((val) => val === 'true'),
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf,text/plain'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // WebSocket Configuration
  SOCKET_CORS_ORIGIN: z.string().url(),

  // Redis Configuration (optional)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional().transform((val) => val ? Number(val) : undefined),
  REDIS_PASSWORD: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();
