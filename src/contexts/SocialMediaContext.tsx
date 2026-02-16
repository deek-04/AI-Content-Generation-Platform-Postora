import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface SocialMediaConnection {
  platform: 'pinterest' | 'linkedin' | 'instagram';
  isConnected: boolean;
  accountName?: string;
  profileImage?: string;
}

interface ScheduledPost {
  id: string;
  platform: 'pinterest' | 'linkedin' | 'instagram';
  title?: string;
  content: string;
  imageUrl?: string;
  publishTime: string;
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
}

interface SocialMediaContextType {
  connections: SocialMediaConnection[];
  scheduledPosts: ScheduledPost[];
  addScheduledPost: (post: Omit<ScheduledPost, 'id' | 'status' | 'createdAt'>) => void;
  removeScheduledPost: (id: string) => void;
  updateConnection: (platform: 'pinterest' | 'linkedin' | 'instagram', isConnected: boolean, accountName?: string) => void;
  copyContentToScheduler: (content: string, imageUrl?: string, platform?: 'pinterest' | 'linkedin' | 'instagram', title?: string) => void;
  getConnectionStatus: (platform: 'pinterest' | 'linkedin' | 'instagram') => boolean;
}

const SocialMediaContext = createContext<SocialMediaContextType | undefined>(undefined);

// Use a named function declaration instead of an arrow function for compatibility with Fast Refresh
export function useSocialMedia() {
  const context = useContext(SocialMediaContext);
  if (!context) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
}

interface SocialMediaProviderProps {
  children: ReactNode;
}

export const SocialMediaProvider: React.FC<SocialMediaProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<SocialMediaConnection[]>([
    { platform: 'pinterest', isConnected: false },
    { platform: 'linkedin', isConnected: false },
    { platform: 'instagram', isConnected: false }
  ]);
  
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  // Load connections from localStorage on mount
  useEffect(() => {
    const savedConnections = localStorage.getItem('socialMediaConnections');
    if (savedConnections) {
      setConnections(JSON.parse(savedConnections));
    }

    const savedPosts = localStorage.getItem('scheduledPosts');
    if (savedPosts) {
      setScheduledPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('socialMediaConnections', JSON.stringify(connections));
  }, [connections]);

  // Save scheduled posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  const updateConnection = (platform: 'pinterest' | 'linkedin' | 'instagram', isConnected: boolean, accountName?: string) => {
    // For Pinterest and LinkedIn, always set to connected when requested
    if (platform === 'pinterest' || platform === 'linkedin') {
      setConnections(prev => 
        prev.map(conn => 
          conn.platform === platform 
            ? { ...conn, isConnected: true, accountName: accountName || `Dummy ${platform} Account` }
            : conn
        )
      );
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`);
    } else {
      // For other platforms, use the provided isConnected value
      setConnections(prev => 
        prev.map(conn => 
          conn.platform === platform 
            ? { ...conn, isConnected, accountName }
            : conn
        )
      );
      
      if (isConnected) {
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`);
      } else {
        toast.info(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`);
      }
    }
  };

  const addScheduledPost = (post: Omit<ScheduledPost, 'id' | 'status' | 'createdAt'>) => {
    const newPost: ScheduledPost = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setScheduledPosts(prev => [newPost, ...prev]);
    toast.success('Post added to scheduler!');
  };

  const removeScheduledPost = (id: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== id));
    toast.success('Post removed from scheduler');
  };

  const copyContentToScheduler = (content: string, imageUrl?: string, platform?: 'instagram' | 'linkedin' | 'pinterest', title?: string) => {
    // This will be used to copy content from Pinterest/Instagram/LinkedIn creators to scheduler
    // We'll implement this functionality in the scheduler component
    const schedulerData = {
      title,
      content,
      imageUrl,
      platform: platform || 'pinterest'
    };
    
    // Store the platform-specific details to ensure they're updated in the correct sheet
    localStorage.setItem('schedulerDraft', JSON.stringify(schedulerData));
    toast.success(`Content copied to scheduler! Navigate to Scheduler to schedule this ${platform || 'pinterest'} post.`);
  };

  const getConnectionStatus = (platform: 'instagram' | 'linkedin' | 'pinterest') => {
    const connection = connections.find(conn => conn.platform === platform);
    return connection?.isConnected || false;
  };

  const value: SocialMediaContextType = {
    connections,
    scheduledPosts,
    addScheduledPost,
    removeScheduledPost,
    updateConnection,
    copyContentToScheduler,
    getConnectionStatus
  };

  return (
    <SocialMediaContext.Provider value={value}>
      {children}
    </SocialMediaContext.Provider>
  );
};
