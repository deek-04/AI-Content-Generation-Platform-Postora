import { backendApi, zapierWebhookClient } from '@/lib/api';

export interface ScheduledPost {
  id: string;
  platform: 'pinterest' | 'linkedin' | 'instagram';
  title?: string;
  content: string;
  imageUrl?: string;
  publishTime: string;
  status: 'pending' | 'published' | 'failed';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulePostParams {
  platform: 'pinterest' | 'linkedin' | 'instagram';
  title?: string;
  content: string;
  imageUrl?: string;
  publishTime: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  platform: 'pinterest' | 'linkedin' | 'instagram';
}

export class SchedulingService {
  // Zapier status helpers
  static isZapierConfigured(): boolean {
    try {
      // baseURL is set from VITE_ZAPIER_WEBHOOK_URL; treat non-empty as configured
      // @ts-ignore accessing private axios config
      const url: string | undefined = zapierWebhookClient?.defaults?.baseURL;
      return !!url && url.length > 0;
    } catch {
      return false;
    }
  }

  static async testZapier(): Promise<boolean> {
    // Try Zapier direct first
    const payload = { action: 'health_check', timestamp: new Date().toISOString() };
    try {
      if (this.isZapierConfigured()) {
        console.debug('Testing direct Zapier webhook...');
        const resp = await zapierWebhookClient.post('', payload);
        console.debug('Zapier response', resp?.status);
        return true;
      }
    } catch (e) {
      console.error('Direct Zapier test failed', e);
    }

    // Try backend relay if configured
    try {
      console.debug('Testing backend relay /schedule endpoint...');
      await backendApi.post('/schedule', { action: 'health_check' }, { headers: { 'x-schedule-secret': import.meta.env.VITE_SCHEDULE_SECRET || '' } });
      return true;
    } catch (e) {
      console.error('Backend relay test failed', e);
      return false;
    }
  }
  // Pinterest OAuth
  static async initiatePinterestAuth(): Promise<string> {
    try {
      const response = await backendApi.get('/auth/pinterest/url');
      return response.data.authUrl;
    } catch (error) {
      console.error('Error getting Pinterest auth URL:', error);
      throw new Error('Failed to initiate Pinterest authentication');
    }
  }

  static async handlePinterestCallback(code: string): Promise<OAuthTokens> {
    try {
      const response = await backendApi.post('/auth/pinterest/callback', { code });
      return response.data;
    } catch (error) {
      console.error('Error handling Pinterest callback:', error);
      throw new Error('Failed to complete Pinterest authentication');
    }
  }

  // LinkedIn OAuth
  static async initiateLinkedInAuth(): Promise<string> {
    try {
      const response = await backendApi.get('/auth/linkedin/url');
      return response.data.authUrl;
    } catch (error) {
      console.error('Error getting LinkedIn auth URL:', error);
      throw new Error('Failed to initiate LinkedIn authentication');
    }
  }

  static async handleLinkedInCallback(code: string): Promise<OAuthTokens> {
    try {
      const response = await backendApi.post('/auth/linkedin/callback', { code });
      return response.data;
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      throw new Error('Failed to complete LinkedIn authentication');
    }
  }

  // Token Management
  static async refreshTokens(platform: 'pinterest' | 'linkedin' | 'instagram'): Promise<OAuthTokens> {
    try {
      const response = await backendApi.post(`/auth/${platform}/refresh`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing ${platform} tokens:`, error);
      throw new Error(`Failed to refresh ${platform} tokens`);
    }
  }

  static async getTokens(platform: 'pinterest' | 'linkedin' | 'instagram'): Promise<OAuthTokens | null> {
    try {
      const response = await backendApi.get(`/auth/${platform}/tokens`);
      return response.data;
    } catch (error) {
      console.error(`Error getting ${platform} tokens:`, error);
      return null;
    }
  }

  // Post Scheduling via Google Sheets
  static async schedulePost(params: SchedulePostParams): Promise<ScheduledPost> {
    try {
      const payload = {
        platform: params.platform,
        title: params.title || '',
        content: params.content,
        imageUrl: params.imageUrl || null,
        publishTime: params.publishTime,
      };

      // Send to backend which will add to Google Sheets
      console.debug('Sending schedule to backend for Google Sheets integration');
      const backendResp = await backendApi.post('/api/schedule', payload, {
        headers: {
          'x-schedule-secret': import.meta.env.VITE_SCHEDULE_SECRET || '',
          'Content-Type': 'application/json',
        },
      });
      console.debug('Backend schedule response', backendResp?.status, backendResp?.data);

      // Return the scheduled post from backend response
      if (backendResp.data && backendResp.data.item) {
        return backendResp.data.item;
      }

      // Fallback synthetic post if backend doesn't return item
      const synthetic: ScheduledPost = {
        id: `post_${Date.now()}`,
        platform: params.platform,
        title: params.title || '',
        content: params.content,
        imageUrl: params.imageUrl,
        publishTime: params.publishTime,
        status: 'pending',
        userId: 'current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return synthetic;
    } catch (error) {
      console.error('Error scheduling post via Google Sheets:', error);
      throw new Error('Failed to schedule post');
    }
  }

  static async getScheduledPosts(): Promise<ScheduledPost[]> {
    try {
      // If using Zapier only, we may not have a backend list; return empty list for now
      const response = await backendApi.get('/api/schedule');
      return response.data;
    } catch (error) {
      // Fallback to empty until backend supports listing from Zapier or a DB
      return [];
    }
  }

  static async updateScheduledPost(id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> {
    try {
      const response = await backendApi.put(`/api/schedule/${id}/status`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw new Error('Failed to update scheduled post');
    }
  }

  static async deleteScheduledPost(id: string): Promise<void> {
    try {
      await backendApi.delete(`/api/schedule/${id}`);
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw new Error('Failed to delete scheduled post');
    }
  }

  // Platform-specific scheduling (deprecated in favor of schedulePost via Zapier)
  static async schedulePinterestPost(params: SchedulePostParams): Promise<ScheduledPost> {
    return this.schedulePost(params);
  }

  static async scheduleLinkedInPost(params: SchedulePostParams): Promise<ScheduledPost> {
    return this.schedulePost(params);
  }

  // Post Publishing (for immediate posts)
  static async publishNow(params: Omit<SchedulePostParams, 'publishTime'>): Promise<ScheduledPost> {
    try {
      const response = await backendApi.post('/publish/now', params);
      return response.data;
    } catch (error) {
      console.error('Error publishing post:', error);
      throw new Error('Failed to publish post');
    }
  }

  // Analytics and Status
  static async getPostStatus(id: string): Promise<ScheduledPost> {
    try {
      const response = await backendApi.get(`/schedule/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting post status:', error);
      throw new Error('Failed to get post status');
    }
  }

  static async getPublishingStats(): Promise<{
    total: number;
    pending: number;
    published: number;
    failed: number;
  }> {
    try {
      const response = await backendApi.get('/schedule/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting publishing stats:', error);
      throw new Error('Failed to get publishing stats');
    }
  }
}
