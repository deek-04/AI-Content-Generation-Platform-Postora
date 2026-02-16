export interface ShareableContent {
  id: string;
  title: string;
  content: string;
  platform: string;
  createdAt: string;
  shareUrl: string;
}

export interface ShareOptions {
  title?: string;
  description?: string;
  image?: string;
  tags?: string[];
  expiresAt?: Date;
  isPublic?: boolean;
}

export class SharingService {
  private static baseUrl = import.meta.env.VITE_APP_URL || 'https://postora.app';

  // Generate a shareable link
  static generateShareLink(content: string, options: ShareOptions = {}): string {
    try {
      // Create a unique ID for the content
      const contentId = this.generateContentId();
      
      // Encode the content and options
      const shareData = {
        id: contentId,
        content: btoa(encodeURIComponent(content)), // Base64 encode
        title: options.title || 'Generated Content',
        description: options.description || 'AI-generated content from Postora',
        image: options.image,
        tags: options.tags || [],
        createdAt: new Date().toISOString(),
        expiresAt: options.expiresAt?.toISOString(),
        isPublic: options.isPublic ?? true
      };

      // Store in localStorage for now (in production, this would go to a database)
      this.storeSharedContent(shareData);
      
      // Generate the share URL
      const shareUrl = `${this.baseUrl}/share/${contentId}`;
      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      throw new Error('Failed to generate share link');
    }
  }

  // Share to social media platforms
  static async shareToSocialMedia(
    content: string, 
    platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
    options: ShareOptions = {}
  ): Promise<void> {
    try {
      const shareUrl = this.generateShareLink(content, options);
      const encodedContent = encodeURIComponent(content.substring(0, 100) + '...');
      
      let shareUrl_platform = '';
      
      switch (platform) {
        case 'twitter':
          shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedContent}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodedContent}`;
          break;
        case 'linkedin':
          shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'whatsapp':
          shareUrl_platform = `https://wa.me/?text=${encodedContent}%20${encodeURIComponent(shareUrl)}`;
          break;
        default:
          throw new Error('Unsupported platform');
      }
      
      // Open in new window
      window.open(shareUrl_platform, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      throw new Error(`Failed to share to ${platform}`);
    }
  }

  // Copy content to clipboard
  static async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }

  // Generate QR code for sharing
  static generateQRCode(shareUrl: string): string {
    try {
      // In a real implementation, you would use a QR code library
      // For now, we'll return a placeholder
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      return qrApiUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Get shared content by ID
  static getSharedContent(contentId: string): ShareableContent | null {
    try {
      const stored = localStorage.getItem(`shared_content_${contentId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          content: decodeURIComponent(atob(data.content)), // Decode base64
          shareUrl: `${this.baseUrl}/share/${contentId}`
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting shared content:', error);
      return null;
    }
  }

  // Get all shared content for current user
  static getAllSharedContent(): ShareableContent[] {
    try {
      const sharedContent: ShareableContent[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('shared_content_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              sharedContent.push({
                ...data,
                content: decodeURIComponent(atob(data.content)),
                shareUrl: `${this.baseUrl}/share/${data.id}`
              });
            } catch (e) {
              console.error('Error parsing stored content:', e);
            }
          }
        }
      });
      
      return sharedContent.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting all shared content:', error);
      return [];
    }
  }

  // Delete shared content
  static deleteSharedContent(contentId: string): boolean {
    try {
      localStorage.removeItem(`shared_content_${contentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting shared content:', error);
      return false;
    }
  }

  // Update shared content
  static updateSharedContent(contentId: string, updates: Partial<ShareableContent>): boolean {
    try {
      const existing = this.getSharedContent(contentId);
      if (existing) {
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        this.storeSharedContent(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating shared content:', error);
      return false;
    }
  }

  // Generate embed code for websites
  static generateEmbedCode(shareUrl: string, options: { width?: number; height?: number } = {}): string {
    const width = options.width || 600;
    const height = options.height || 400;
    
    return `<iframe src="${shareUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
  }

  // Share via email
  static shareViaEmail(content: string, options: ShareOptions = {}): void {
    try {
      const shareUrl = this.generateShareLink(content, options);
      const subject = encodeURIComponent(options.title || 'Check out this content from Postora');
      const body = encodeURIComponent(
        `Hi,\n\nI thought you might be interested in this content:\n\n${content.substring(0, 200)}...\n\nView the full content here: ${shareUrl}\n\nBest regards`
      );
      
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error('Error sharing via email:', error);
      throw new Error('Failed to share via email');
    }
  }

  // Private helper methods
  private static generateContentId(): string {
    return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private static storeSharedContent(shareData: any): void {
    try {
      localStorage.setItem(`shared_content_${shareData.id}`, JSON.stringify(shareData));
    } catch (error) {
      console.error('Error storing shared content:', error);
      throw new Error('Failed to store shared content');
    }
  }
}
