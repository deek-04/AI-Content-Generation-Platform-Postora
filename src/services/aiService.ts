import { rapidApiImageClient } from "../lib/api";
// Generate image using RapidAPI
export async function generateImageWithRapidAPI(prompt: string) {
  try {
    const response = await rapidApiImageClient.post("/v1/text-to-image", {
      prompt,
      // Add other params as required by the RapidAPI endpoint
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}
import { groqApi, stabilityApi } from '@/lib/api';

export interface ContentGenerationParams {
  topic: string;
  platform: 'pinterest' | 'linkedin' | 'blog' | 'youtube' | 'instagram';
  tone: string;
  targetAudience?: string;
  keywords?: string;
  postType?: string;
  industry?: string;
  keyMessage?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeCallToAction?: boolean;
}

export interface ImageGenerationParams {
  prompt: string;
  platform: 'pinterest' | 'linkedin' | 'instagram';
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16' | '2:3'; // 2:3 for Pinterest
  postType?: 'post' | 'reel' | 'pin';
}

export class AIService {
  static async generateContent(params: ContentGenerationParams): Promise<string> {
    try {
      const prompt = this.buildPrompt(params);
      
      const response = await groqApi.post('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media content creator. Generate engaging, platform-specific content that drives engagement and follows best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  static async generateTitle(content: string, platform: string): Promise<string> {
    try {
      const prompt = `Generate a catchy, engaging title for this ${platform} post content. The title should be concise (maximum 10 words), attention-grabbing, and relevant to the content. Return ONLY the title text with no quotes or additional formatting:

${content.substring(0, 500)}...`;
      
      const response = await groqApi.post('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating engaging social media titles that drive clicks and engagement. Create concise, powerful titles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
        stream: false
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating title:', error);
      throw new Error('Failed to generate title. Please try again.');
    }
  }

  static async searchRelatedImage(content: string, platform: string): Promise<string> {
    try {
      // Extract key terms from content for image search using Groq API
      const prompt = `Analyze this social media content and extract 8-10 specific, detailed, and visually descriptive keywords that would be ideal for finding a relevant image. Include colors, objects, scenes, emotions, and style descriptors:

${content.substring(0, 500)}...

Provide ONLY the keywords separated by commas, no explanations or other text.`;
      
      const response = await groqApi.post('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing content and extracting precise, descriptive keywords for image searches. Extract only the most visually relevant terms, including specific objects, scenes, colors, emotions, and style descriptors.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
        stream: false
      });

      const searchTerms = response.data.choices[0].message.content.trim();
      console.log('Image search terms:', searchTerms);
      
      // Generate image link to be used in the content
      const imageLink = `https://source.unsplash.com/random?${searchTerms.replace(/,/g, '+')}`;
      console.log('Generated image link:', imageLink);
      
      // Use the search terms to find an image with appropriate aspect ratio for the platform
      return await this.generateImage({
        prompt: `High-quality professional photograph of ${searchTerms}, perfect for ${platform}, trending on Unsplash, detailed, vibrant colors, 4K, professional lighting`,
        platform: platform as 'instagram' | 'linkedin' | 'pinterest',
        style: 'modern',
        aspectRatio: platform === 'pinterest' ? '2:3' : '1:1'
      });
    } catch (error) {
      console.error('Error searching related image:', error);
      throw new Error('Failed to find a related image. Please try again.');
    }
  }

  static async generateImage(params: ImageGenerationParams): Promise<string> {
    try {
      // Choose aspect ratio based on postType or aspectRatio
      let width = 512, height = 512;
      if (params.postType === 'reel' || params.aspectRatio === '9:16') {
        width = 576; height = 1024; // 9:16 for reels
      } else if (params.aspectRatio === '16:9') {
        width = 1024; height = 576;
      } else if (params.aspectRatio === '4:5') {
        width = 820; height = 1024;
      } else if (params.aspectRatio === '1:1') {
        width = 1024; height = 1024;
      } else if (params.aspectRatio === '2:3' || params.platform === 'pinterest') {
        width = 680; height = 1020; // 2:3 for Pinterest pins
      }

      // Use RapidAPI image generator
      const response = await rapidApiImageClient.post('/image', {
        prompt: params.prompt,
        negative_prompt: "white",
        width,
        height,
        hr_scale: 2
      });
      console.log('RapidAPI image response:', response);
      const data = response.data;

      // Common response shapes from various RapidAPI image generators
      // 1) direct url: { url: 'https://...' }
      if (typeof data === 'string' && data.startsWith('http')) return data;
      if (data?.url) return data.url;

      // 2) some providers return an object with `result` or `image`
      if (data?.result) return data.result;
      if (data?.image) return data.image;

      // 3) base64 in different fields
      const base64Candidates = [
        data?.base64,
        data?.b64_json,
        data?.b64,
        data?.data?.[0]?.b64_json,
        data?.data?.[0]?.b64,
        data?.artifacts?.[0]?.base64,
        data?.output?.[0]?.b64_image,
        data?.output?.[0]?.base64,
        data?.output?.[0]?.b64,
      ];
      const foundBase64 = base64Candidates.find(Boolean) as string | undefined;
      if (foundBase64) {
        // Some responses are plain base64, others are JSON-escaped base64 strings
        const b64 = foundBase64.replace(/^data:image\/(png|jpeg);base64,/, "");
        return `data:image/png;base64,${b64}`;
      }

      // 4) array outputs
      if (Array.isArray(data?.output) && data.output.length > 0) {
        const out = data.output[0];
        if (typeof out === 'string' && out.startsWith('http')) return out;
        if (out?.b64_json || out?.base64) return `data:image/png;base64,${out.b64_json || out.base64}`;
      }

      console.error('No usable image found in RapidAPI response:', data);
      throw new Error('No image returned');
    } catch (error: any) {
      console.error('Error generating image:', error?.response?.data || error);
      throw new Error(error?.response?.data?.message || 'Failed to generate image. Please try again.');
    }
  }

  static async summarizeURL(url: string, outputFormat: string, options: any): Promise<string> {
    try {
      const prompt = `Summarize the content from this URL: ${url}
      
Output format: ${outputFormat}
Include hashtags: ${options.includeHashtags}
Include key points: ${options.includeKeyPoints}

Please provide a comprehensive summary that can be used for social media content.`;

      const response = await groqApi.post('/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content summarizer. Extract key insights and create engaging social media content from articles and web pages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error summarizing URL:', error);
      throw new Error('Failed to summarize URL. Please try again.');
    }
  }

  private static buildPrompt(params: ContentGenerationParams): string {
    let prompt = `Create a ${params.platform} ${params.postType || 'post'} about "${params.topic}" with the following requirements:

Platform: ${params.platform}
Tone: ${params.tone}
${params.targetAudience ? `Target Audience: ${params.targetAudience}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}
${params.keyMessage ? `Key Message: ${params.keyMessage}` : ''}
${params.keywords ? `Keywords: ${params.keywords}` : ''}

Requirements:
- Make it engaging and platform-appropriate
- ${params.includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
- ${params.includeEmojis ? 'Use emojis strategically' : 'No emojis'}
- ${params.includeCallToAction ? 'Include a call to action' : 'No call to action'}
- Keep it authentic and valuable
- Follow ${params.platform} best practices
- Make the content ready to post without requiring any additional editing
- Include a section with 3-5 todo steps for implementing this content strategy
- Include helpful comments or notes about the content strategy

Please generate the content now, ensuring it's completely ready to post:`;

    return prompt;
  }
}
