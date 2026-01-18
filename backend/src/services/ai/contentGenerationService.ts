import { openaiService } from './openaiService';
import { env } from '../../config/env';

/**
 * Content generation options
 */
export interface ContentGenerationOptions {
  tone?: 'professional' | 'casual' | 'formal' | 'friendly' | 'creative';
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullet-points' | 'numbered-list';
  language?: string;
}

/**
 * Content generation result
 */
export interface ContentGenerationResult {
  content: string;
  tokensUsed: number;
}

/**
 * Outline item
 */
export interface OutlineItem {
  title: string;
  level: number;
  children?: OutlineItem[];
}

/**
 * Template type
 */
export type TemplateType = 
  | 'meeting-notes'
  | 'project-plan'
  | 'to-do-list'
  | 'research-notes'
  | 'brainstorm'
  | 'blog-post'
  | 'article'
  | 'essay'
  | 'report'
  | 'letter';

/**
 * Content Generation Service
 * Generate outlines, templates, and content using AI
 */
export class ContentGenerationService {
  /**
   * Generate content based on prompt
   * @param prompt - Content prompt
   * @param options - Generation options
   * @returns Promise<ContentGenerationResult>
   */
  async generateContent(
    prompt: string,
    options: ContentGenerationOptions = {}
  ): Promise<ContentGenerationResult> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    const {
      tone = 'professional',
      length = 'medium',
      format = 'paragraph',
      language = 'English'
    } = options;

    const lengthGuide = {
      short: '1-2 paragraphs',
      medium: '3-5 paragraphs',
      long: '6+ paragraphs'
    };

    const formatGuide = {
      paragraph: 'well-structured paragraphs',
      'bullet-points': 'bullet points',
      'numbered-list': 'a numbered list'
    };

    const systemPrompt = `You are a helpful content writer. Generate content in ${language} with these requirements:
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Format: ${formatGuide[format]}
- Be clear, informative, and well-structured`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: this.getMaxTokensForLength(length),
      });
    });

    const content = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed
    };
  }

  /**
   * Generate outline from topic
   * @param topic - Topic or title
   * @param depth - Outline depth (1-3)
   * @param numberOfPoints - Number of main points
   * @returns Promise<OutlineItem[]>
   */
  async generateOutline(
    topic: string,
    depth: number = 2,
    numberOfPoints: number = 5
  ): Promise<OutlineItem[]> {
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic cannot be empty');
    }

    const systemPrompt = `You are an expert at creating structured outlines.
Create a ${depth}-level hierarchical outline for the topic: "${topic}"
Include ${numberOfPoints} main points, each with relevant sub-points.

Format as:
1. Main Point
   1.1. Sub-point
   1.2. Sub-point
2. Main Point
   2.1. Sub-point
   ...`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: topic }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    });

    const outlineText = result.choices[0]?.message?.content || '';
    return this.parseOutline(outlineText);
  }

  /**
   * Generate note template
   * @param templateType - Type of template
   * @param customParams - Custom parameters for template
   * @returns Promise<ContentGenerationResult>
   */
  async generateTemplate(
    templateType: TemplateType,
    customParams: Record<string, string> = {}
  ): Promise<ContentGenerationResult> {
    const templatePrompts: Record<TemplateType, string> = {
      'meeting-notes': `Create a meeting notes template with sections for:
- Meeting title and date
- Attendees
- Agenda items
- Discussion points
- Action items
- Next steps`,
      
      'project-plan': `Create a project plan template with sections for:
- Project overview
- Objectives
- Timeline
- Resources
- Milestones
- Risks and mitigation`,
      
      'to-do-list': `Create a to-do list template with:
- Priority tasks
- Today's goals
- Long-term tasks
- Notes section`,
      
      'research-notes': `Create a research notes template with sections for:
- Topic and research question
- Sources
- Key findings
- Quotes and citations
- Analysis
- Conclusions`,
      
      'brainstorm': `Create a brainstorming template with:
- Central topic
- Ideas section
- Categories
- Action items
- Follow-up questions`,
      
      'blog-post': `Create a blog post template with:
- Title
- Introduction
- Main body sections
- Conclusion
- Call to action`,
      
      'article': `Create an article template with:
- Headline
- Subheading
- Introduction
- Body sections
- Conclusion`,
      
      'essay': `Create an essay template with:
- Title
- Introduction with thesis
- Body paragraphs
- Conclusion
- References`,
      
      'report': `Create a report template with:
- Executive summary
- Introduction
- Methodology
- Findings
- Recommendations
- Conclusion`,
      
      'letter': `Create a letter template with:
- Date
- Recipient address
- Salutation
- Body paragraphs
- Closing
- Signature`
    };

    let prompt = templatePrompts[templateType];
    
    // Add custom parameters
    if (Object.keys(customParams).length > 0) {
      prompt += '\n\nCustom requirements:';
      Object.entries(customParams).forEach(([key, value]) => {
        prompt += `\n- ${key}: ${value}`;
      });
    }

    return this.generateContent(prompt, { format: 'paragraph', length: 'medium' });
  }

  /**
   * Expand brief notes into detailed content
   * @param briefNotes - Brief notes or bullet points
   * @param targetLength - Target length
   * @returns Promise<ContentGenerationResult>
   */
  async expandNotes(
    briefNotes: string,
    targetLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<ContentGenerationResult> {
    if (!briefNotes || briefNotes.trim().length === 0) {
      throw new Error('Notes cannot be empty');
    }

    const systemPrompt = `You are a helpful writing assistant. Expand the following brief notes into detailed, well-written content.
Maintain the original meaning and key points while adding context, examples, and proper structure.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: briefNotes }
        ],
        temperature: 0.7,
        max_tokens: this.getMaxTokensForLength(targetLength),
      });
    });

    const content = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed
    };
  }

  /**
   * Generate creative writing prompts
   * @param genre - Writing genre
   * @param count - Number of prompts
   * @returns Promise<string[]>
   */
  async generateWritingPrompts(
    genre: string,
    count: number = 5
  ): Promise<string[]> {
    const systemPrompt = `Generate ${count} creative writing prompts for ${genre}.
Each prompt should be engaging, specific, and inspire creativity.
Format: One prompt per line, numbered.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${count} ${genre} writing prompts` }
        ],
        temperature: 0.9,
        max_tokens: 500,
      });
    });

    const response = result.choices[0]?.message?.content || '';
    
    return response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(prompt => prompt.length > 0)
      .slice(0, count);
  }

  /**
   * Rewrite content in different style
   * @param content - Original content
   * @param targetStyle - Target writing style
   * @returns Promise<ContentGenerationResult>
   */
  async rewriteContent(
    content: string,
    targetStyle: string
  ): Promise<ContentGenerationResult> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const systemPrompt = `You are an expert writer. Rewrite the following content in a ${targetStyle} style.
Maintain the core message and information while adapting the tone and presentation.`;

    const result = await openaiService.withRetry(async () => {
      const client = openaiService.getClient();
      return await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
        max_tokens: Math.max(content.length * 2, 500),
      });
    });

    const rewrittenContent = result.choices[0]?.message?.content?.trim() || '';
    const tokensUsed = result.usage?.total_tokens || 0;

    return {
      content: rewrittenContent,
      tokensUsed
    };
  }

  /**
   * Parse outline text into structured format
   */
  private parseOutline(outlineText: string): OutlineItem[] {
    const lines = outlineText.split('\n').filter(line => line.trim().length > 0);
    const outline: OutlineItem[] = [];
    const stack: { item: OutlineItem; level: number }[] = [];

    for (const line of lines) {
      const match = line.match(/^(\s*)(\d+\.)+\s*(.+)$/);
      if (!match) continue;

      const indentation = match[1].length;
      const numbering = match[2];
      const title = match[3].trim();
      
      const level = numbering.split('.').filter(n => n).length;

      const item: OutlineItem = { title, level };

      // Determine where to add this item
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        outline.push(item);
      } else {
        const parent = stack[stack.length - 1].item;
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      }

      stack.push({ item, level });
    }

    return outline;
  }

  /**
   * Get max tokens based on length
   */
  private getMaxTokensForLength(length: 'short' | 'medium' | 'long'): number {
    const tokenLimits = {
      short: 300,
      medium: 800,
      long: 2000
    };
    return tokenLimits[length];
  }
}

// Singleton instance
export const contentGenerationService = new ContentGenerationService();
