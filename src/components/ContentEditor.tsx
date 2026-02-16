import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, Share, Wand2, FileText, Link, QrCode, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"
import { SharingService } from "@/services/sharingService"
import { useSocialMedia } from "@/contexts/SocialMediaContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContentEditorProps {
  content: string
  isGenerating?: boolean
  placeholder?: string
  title?: string
  platform?: string
  imageUrl?: string
  imageLink?: string
  onChange?: (content: string) => void
}

export function ContentEditor({ 
  content, 
  isGenerating = false, 
  placeholder = "Your generated content will appear here...",
  title = "Generated Content",
  platform = "social-media",
  imageUrl,
  imageLink,
  onChange
}: ContentEditorProps) {
  const { copyContentToScheduler } = useSocialMedia();
  const [editableContent, setEditableContent] = useState(content)
  // Sync editableContent with content prop when it changes
  useEffect(() => {
    setEditableContent(content)
  }, [content])
  
  // Handle content changes and propagate to parent if onChange is provided
  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent)
    if (onChange) {
      onChange(newContent)
    }
  }

  const handleCopy = async () => {
    try {
      await SharingService.copyToClipboard(editableContent)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const handleDownload = async () => {
    try {
      // Add image to content if available
      let contentWithImage = editableContent;
      
      if (imageUrl) {
        // Check if imageUrl is valid
        const isValidUrl = (url: string) => {
          try {
            new URL(url);
            return true;
          } catch (e) {
            return false;
          }
        };
        
        if (isValidUrl(imageUrl)) {
          contentWithImage = `![${title}](${imageUrl})\n\n${editableContent}`;
        } else if (imageLink && isValidUrl(imageLink)) {
          // Try using imageLink as fallback
          contentWithImage = `![${title}](${imageLink})\n\n${editableContent}`;
        }
      }
      
      // Create a text file and trigger download
      const blob = new Blob([contentWithImage], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Content downloaded as text file!")
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download content. Please try again.")
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = SharingService.generateShareLink(editableContent, {
        title: title,
        description: `AI-generated ${platform} content from Postora`,
        tags: [platform, 'ai-generated', 'postora']
      })
      
      // Copy share URL to clipboard
      await SharingService.copyToClipboard(shareUrl)
      toast.success("Share link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to generate share link")
    }
  }

  const handleSocialShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    try {
      await SharingService.shareToSocialMedia(editableContent, platform, {
        title: title,
        description: `AI-generated ${platform} content from Postora`
      })
    } catch (error) {
      toast.error(`Failed to share to ${platform}`)
    }
  }

  const handleEmailShare = () => {
    try {
      SharingService.shareViaEmail(editableContent, {
        title: title,
        description: `AI-generated ${platform} content from Postora`
      })
    } catch (error) {
      toast.error("Failed to share via email")
    }
  }

  const handleQRCode = () => {
    try {
      const shareUrl = SharingService.generateShareLink(editableContent, {
        title: title,
        description: `AI-generated ${platform} content from Postora`
      })
      const qrUrl = SharingService.generateQRCode(shareUrl)
      
      // Open QR code in new window
      window.open(qrUrl, '_blank', 'width=300,height=300')
    } catch (error) {
      toast.error("Failed to generate QR code")
    }
  }

  const handleCopyToScheduler = () => {
    if (editableContent) {
      // Generate an image link if not provided
      const imageToUse = imageUrl || imageLink || `https://source.unsplash.com/random?${encodeURIComponent(editableContent.substring(0, 50))}`;
      copyContentToScheduler(editableContent, imageToUse, platform as 'pinterest' | 'linkedin' | 'instagram');
      toast.success("Content copied to scheduler with image link");
    } else {
      toast.error("No content to copy to scheduler");
    }
  }
  
  // Display image link if available
  const showImageLink = () => {
    if (imageLink) {
      toast.success(
        <div className="space-y-2">
          <p>Image link available:</p>
          <div className="p-2 bg-muted rounded text-xs overflow-hidden">
            {imageLink}
          </div>
        </div>,
        { duration: 5000 }
      );
    } else {
      toast.error("No image link available");
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Content Editor</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!editableContent || isGenerating}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!editableContent || isGenerating}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToScheduler}
            disabled={!editableContent || isGenerating}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!editableContent || isGenerating}
                className="gap-2"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleShare}>
                <Link className="w-4 h-4 mr-2" />
                Copy Share Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                <span className="w-4 h-4 mr-2">🐦</span>
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                <span className="w-4 h-4 mr-2">📘</span>
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                <span className="w-4 h-4 mr-2">💼</span>
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                <span className="w-4 h-4 mr-2">📱</span>
                Share on WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEmailShare}>
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleQRCode}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        <Card className="h-full bg-muted/20 border-dashed border-2">
          {isGenerating ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Wand2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <div>
                  <h4 className="text-lg font-medium text-gradient">AI Magic in Progress</h4>
                  <p className="text-muted-foreground">Creating amazing content for you...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {imageLink && (
                <div className="mb-4 p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-primary" />
                      <span className="font-medium">Image Link:</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(imageLink);
                        toast.success("Image link copied to clipboard!");
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground break-all bg-background/50 p-2 rounded">
                    {imageLink}
                  </div>
                </div>
              )}
              <Textarea
                value={editableContent.replace(/\*/g, "")}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-h-[500px] resize-none border-none bg-transparent focus:ring-0 text-base leading-relaxed"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Editor Footer */}
      {editableContent && !isGenerating && (
        <div className="p-4 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {editableContent.length} characters
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Ready to share
              </span>
            </div>
            <div className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}