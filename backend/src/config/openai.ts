import OpenAI from 'openai';
import { env } from './env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const OPENAI_CONFIG = {
  model: env.OPENAI_MODEL,
  embeddingModel: env.OPENAI_EMBEDDING_MODEL,
  maxTokens: 1000,
  temperature: 0.7,
};

export default openai;
