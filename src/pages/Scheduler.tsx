import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, Trash2, Linkedin, CheckCircle, XCircle, AlertCircle, Settings, RefreshCw, FileSpreadsheet, CalendarDays } from "lucide-react"
import { BrandPinterest } from "tabler-icons-react"
import { SchedulingService, ScheduledPost, OAuthTokens } from "@/services/schedulingService"
import { useSocialMedia } from "@/contexts/SocialMediaContext"
import { toast } from "sonner"
import { format, addDays, addHours } from "date-fns"

interface NewPostForm {
  platform: 'instagram' | 'linkedin' | 'pinterest';
  title: string;
  content: string;
  imageUrl?: string;
  publishTime: string;
}

export default function Scheduler() {
  const { 
    connections, 
    scheduledPosts, 
    addScheduledPost, 
    removeScheduledPost, 
    updateConnection,
    getConnectionStatus 
  } = useSocialMedia();
  
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPost, setNewPost] = useState<NewPostForm>({
    platform: 'pinterest',
    title: '',
    content: '',
    imageUrl: '',
    publishTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
  })
  const [isLoading, setIsLoading] = useState(false)
  // Removed Zapier integration state
  const [isConnecting, setIsConnecting] = useState(false)

  // Removed Zapier health check
  useEffect(() => {
    // Component initialization
  }, []);

  // Check for draft content from other pages
  useEffect(() => {
    const draft = localStorage.getItem('schedulerDraft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setNewPost({
        platform: draftData.platform || 'instagram',
        title: draftData.title || '',
        content: draftData.content || '',
        imageUrl: draftData.imageUrl || '',
        publishTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
      });
        setShowNewPostForm(true);
        localStorage.removeItem('schedulerDraft');
        toast.success(`Content copied from ${draftData.platform} creator! Ready to schedule.`);
      } catch (error) {
        console.error('Error parsing draft data:', error);
      }
    }
  }, []);

  const loadScheduledPosts = async () => {
    // This is now handled by the context
    console.log('Scheduled posts loaded from context:', scheduledPosts.length);
  };

  const handlePinterestAuth = async () => {
    const isConnected = getConnectionStatus('pinterest');
    if (isConnected) {
      updateConnection('pinterest', false);
      return;
    }

    setIsConnecting(true);
    try {
      // For demo purposes, we'll simulate a successful auth after a delay
      setTimeout(() => {
        updateConnection('pinterest', true, 'DummyPinterestUser');
        setIsConnecting(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Pinterest');
      setIsConnecting(false);
    }
  };

  const handleLinkedInAuth = async () => {
    const isConnected = getConnectionStatus('linkedin');
    if (isConnected) {
      updateConnection('linkedin', false);
      return;
    }

    setIsConnecting(true);
    try {
      // For demo purposes, we'll simulate a successful auth after a delay
      setTimeout(() => {
        updateConnection('linkedin', true, 'DummyLinkedInUser');
        setIsConnecting(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect LinkedIn');
      setIsConnecting(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please enter post content');
      return;
    }

    if (!newPost.publishTime) {
      toast.error('Please select publish time');
      return;
    }

    // Skip connection check for Pinterest and LinkedIn
    if (newPost.platform !== 'pinterest' && newPost.platform !== 'linkedin') {
      const isPlatformConnected = getConnectionStatus(newPost.platform);
      if (!isPlatformConnected) {
        toast.error(`Please connect your ${newPost.platform} account first`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Add to local context first with platform-specific details
      addScheduledPost({
        platform: newPost.platform,
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        publishTime: newPost.publishTime
      });

      // Send to Zapier for real-time scheduling
      await SchedulingService.schedulePost({
        platform: newPost.platform,
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        publishTime: newPost.publishTime
      });

      setNewPost({
        platform: 'instagram',
        title: '',
        content: '',
        imageUrl: '',
        publishTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
      });
      setShowNewPostForm(false);
      toast.success(`${newPost.platform.charAt(0).toUpperCase() + newPost.platform.slice(1)} post scheduled successfully and sent to Zapier!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Remove from local context immediately
      removeScheduledPost(postId);
      
      // Also try to delete from backend if available
      try {
        await SchedulingService.deleteScheduledPost(postId);
      } catch (backendError) {
        console.warn('Backend delete failed, but post removed locally:', backendError);
      }
      
      toast.success('Post deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-gradient">Content Scheduler</h1>
          <p className="text-muted-foreground">Manage and schedule your social media posts</p>
        </div>
      </div>

      {/* Platform Authentication */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Platform Connections
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <BrandPinterest className="w-6 h-6 text-red-500" />
              <div>
                <div className="font-medium">Pinterest</div>
                <div className="text-sm text-muted-foreground">Connect your Pinterest account</div>
              </div>
            </div>
            <Button
              variant={getConnectionStatus('pinterest') ? "outline" : "default"}
              size="sm"
              onClick={handlePinterestAuth}
              disabled={getConnectionStatus('pinterest') || isConnecting}
            >
              {isConnecting ? "Connecting..." : getConnectionStatus('pinterest') ? "Connected" : "Connect"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Linkedin className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">LinkedIn</div>
                <div className="text-sm text-muted-foreground">Connect your LinkedIn account</div>
              </div>
            </div>
            <Button
              variant={getConnectionStatus('linkedin') ? "outline" : "default"}
              size="sm"
              onClick={handleLinkedInAuth}
              disabled={getConnectionStatus('linkedin') || isConnecting}
            >
              {isConnecting ? "Connecting..." : getConnectionStatus('linkedin') ? "Connected" : "Connect"}
            </Button>
          </div>
          
          {/* Pinterest connection box moved to avoid duplication */}
        </div>
        <div className="mt-4 flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium">Google Sheets Integration</div>
              <div className="text-sm text-muted-foreground">
                Posts will be automatically saved to your connected Google Sheet
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Schedule */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Schedule</h3>
          {!showNewPostForm ? (
            <Button 
              className="w-full justify-start gap-2"
              onClick={() => setShowNewPostForm(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Post
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select 
                  value={newPost.platform} 
                  onValueChange={(value: 'instagram' | 'linkedin' | 'pinterest') => setNewPost({ ...newPost, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pinterest">Pinterest</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Enter your post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Enter your post content..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Publish Time</Label>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={newPost.publishTime}
                    onChange={(e) => setNewPost({ ...newPost, publishTime: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const now = new Date();
                      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
                      setNewPost({ 
                        ...newPost, 
                        publishTime: format(nextHour, "yyyy-MM-dd'T'HH:mm") 
                      });
                    }}
                    title="Set to next hour"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const tomorrow = addDays(new Date(), 1);
                      const tomorrow9AM = new Date(tomorrow);
                      tomorrow9AM.setHours(9, 0, 0, 0);
                      setNewPost({ 
                        ...newPost, 
                        publishTime: format(tomorrow9AM, "yyyy-MM-dd'T'HH:mm") 
                      });
                    }}
                    title="Set to tomorrow 9 AM"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSchedulePost}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Scheduling..." : "Schedule Post"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewPostForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Upcoming Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Posts</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadScheduledPosts}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scheduledPosts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No scheduled posts yet</p>
                <p className="text-sm">Create your first post to get started</p>
              </div>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {post.platform === 'pinterest' ? (
                        <BrandPinterest className="w-4 h-4 text-red-600" />
                      ) : (
                        <Linkedin className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium capitalize">{post.platform}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(post.publishTime), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>


    </div>
  )
}