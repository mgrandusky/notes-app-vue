import { openaiService } from './openaiService';

/**
 * Embedding result
 */
export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  tokensUsed: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokensUsed: number;
}

/**
 * Similarity search result
 */
export interface SimilarityResult {
  index: number;
  similarity: number;
  content: string;
}

/**
 * Vector Embeddings Service for Semantic Search
 * Uses text-embedding-3-small model for efficient embeddings
 */
export class EmbeddingService {
  private readonly model = 'text-embedding-3-small';
  private readonly dimensions = 1536; // Default dimensions for text-embedding-3-small

  /**
   * Generate embedding for a single text
   * @param text - Text to embed
   * @returns Promise<EmbeddingResult>
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Clean and prepare text
    const cleanedText = this.preprocessText(text);

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.embeddings.create({
        model: this.model,
        input: cleanedText,
        encoding_format: 'float',
      });
    });

    const embedding = result.data[0]?.embedding;
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }

    return {
      embedding,
      dimensions: embedding.length,
      tokensUsed: result.usage?.total_tokens || 0
    };
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   * @param texts - Array of texts to embed
   * @param batchSize - Size of each batch (max 2048 for OpenAI)
   * @returns Promise<BatchEmbeddingResult>
   */
  async generateBatchEmbeddings(
    texts: string[],
    batchSize: number = 100
  ): Promise<BatchEmbeddingResult> {
    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    const embeddings: number[][] = [];
    let totalTokensUsed = 0;

    // Process in batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const cleanedBatch = batch.map(text => this.preprocessText(text));

      const result = await openaiService.withRetry(async () => {
        const client = openaiService.getClient();
        return await client.embeddings.create({
          model: this.model,
          input: cleanedBatch,
          encoding_format: 'float',
        });
      });

      // Extract embeddings from batch result
      const batchEmbeddings = result.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
      totalTokensUsed += result.usage?.total_tokens || 0;
    }

    return {
      embeddings,
      totalTokensUsed
    };
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param embedding1 - First embedding vector
   * @param embedding2 - Second embedding vector
   * @returns Similarity score (0 to 1)
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    
    if (magnitude === 0) {
      return 0;
    }

    return dotProduct / magnitude;
  }

  /**
   * Find most similar items to a query embedding
   * @param queryEmbedding - Query embedding vector
   * @param candidateEmbeddings - Array of candidate embeddings
   * @param contents - Original content for each candidate
   * @param topK - Number of top results to return
   * @returns Array of similarity results
   */
  findSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: number[][],
    contents: string[],
    topK: number = 5
  ): SimilarityResult[] {
    if (candidateEmbeddings.length !== contents.length) {
      throw new Error('Number of embeddings must match number of contents');
    }

    const similarities: SimilarityResult[] = candidateEmbeddings.map(
      (embedding, index) => ({
        index,
        similarity: this.cosineSimilarity(queryEmbedding, embedding),
        content: contents[index]
      })
    );

    // Sort by similarity (descending) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Semantic search: Find similar notes to a query
   * @param query - Search query
   * @param noteEmbeddings - Pre-computed note embeddings
   * @param noteContents - Original note contents
   * @param topK - Number of results to return
   * @returns Promise<SimilarityResult[]>
   */
  async semanticSearch(
    query: string,
    noteEmbeddings: number[][],
    noteContents: string[],
    topK: number = 5
  ): Promise<SimilarityResult[]> {
    // Generate embedding for query
    const { embedding: queryEmbedding } = await this.generateEmbedding(query);

    // Find similar notes
    return this.findSimilar(queryEmbedding, noteEmbeddings, noteContents, topK);
  }

  /**
   * Preprocess text before embedding
   * @param text - Raw text
   * @returns Cleaned text
   */
  private preprocessText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 8000); // Limit length (safety measure)
  }

  /**
   * Estimate cost for embedding operations
   * @param textLength - Total length of text
   * @returns Estimated cost in USD
   */
  estimateCost(textLength: number): number {
    // text-embedding-3-small: $0.00002 per 1K tokens
    const estimatedTokens = Math.ceil(textLength / 4);
    const costPer1KTokens = 0.00002;
    return (estimatedTokens / 1000) * costPer1KTokens;
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
