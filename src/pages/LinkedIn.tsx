import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { Linkedin as LinkedinIcon, Sparkles, Briefcase, Users, TrendingUp, Image as ImageIcon, Download, RefreshCw, Calendar, CheckCircle, XCircle, ExternalLink, Type } from "lucide-react"
import { AIService } from "@/services/aiService"
import { useSocialMedia } from "@/contexts/SocialMediaContext"
import { SchedulingService } from "@/services/schedulingService"
import { toast } from "sonner"

const postTypes = [
  { value: "thought-leadership", label: "Thought Leadership" },
  { value: "company-update", label: "Company Update" },
  { value: "industry-news", label: "Industry News" },
  { value: "personal-story", label: "Personal Story" },
  { value: "tips", label: "Professional Tips" }
]

const tones = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "inspirational", label: "Inspirational" },
  { value: "informative", label: "Informative" }
]

const imageStyles = [
  { value: "professional", label: "Professional & Corporate" },
  { value: "modern", label: "Modern & Clean" },
  { value: "minimalist", label: "Minimalist & Elegant" },
  { value: "creative", label: "Creative & Innovative" },
  { value: "business", label: "Business & Executive" }
]

export default function LinkedIn() {
  const { getConnectionStatus, copyContentToScheduler, updateConnection } = useSocialMedia();
  const [formData, setFormData] = useState({
    topic: "",
    postType: "",
    tone: "",
    industry: "",
    keyMessage: "",
    includeHashtags: true,
    includeCallToAction: true
  })
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [selectedImageStyle, setSelectedImageStyle] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  
  const isLinkedInConnected = getConnectionStatus('linkedin');

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await AIService.generateContent({
        topic: formData.topic,
        platform: 'linkedin',
        tone: formData.tone || 'professional',
        industry: formData.industry,
        keyMessage: formData.keyMessage,
        postType: formData.postType || 'thought-leadership',
        includeHashtags: formData.includeHashtags,
        includeCallToAction: formData.includeCallToAction
      });
      
      setGeneratedContent(content);
      
      // Generate title automatically
      try {
        const title = await AIService.generateTitle(content, 'linkedin');
        setGeneratedTitle(title);
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        // Don't show error toast for title generation failure
      }
      
      toast.success("LinkedIn post generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleGenerateImage = async () => {
    if (!formData.topic) {
      toast.error("Please enter a topic first");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `LinkedIn professional post image about ${formData.topic}, ${selectedImageStyle || 'professional'} style, business-focused, high quality, corporate aesthetic, social media optimized`;
      
      const imageUrl = await AIService.generateImage({
        prompt,
        platform: 'linkedin',
        style: selectedImageStyle || 'professional',
        aspectRatio: '16:9'
      });
      
      setGeneratedImage(imageUrl);
      toast.success("Image generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `linkedin-${formData.topic.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    }
  }

  const handleDownloadContent = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-content-${formData.topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Content downloaded as text file!");
    } else {
      toast.error("No content to download");
    }
  }

  const handleCopyToScheduler = () => {
    if (generatedContent) {
      copyContentToScheduler(generatedContent, generatedImage, 'linkedin', generatedTitle);
    } else {
      toast.error("No content to copy to scheduler");
    }
  }

  const handleLinkedInAuth = async () => {
    if (isLinkedInConnected) {
      updateConnection('linkedin', false);
      return;
    }

    setIsConnecting(true);
    try {
      const authUrl = await SchedulingService.initiateLinkedInAuth();
      window.open(authUrl, '_blank', 'width=600,height=600');
      
      // Simulate successful auth after a delay
      setTimeout(() => {
        updateConnection('linkedin', true, 'Your LinkedIn Account');
        setIsConnecting(false);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect LinkedIn');
      setIsConnecting(false);
    }
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <LinkedinIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-orbitron font-bold text-gradient">LinkedIn Content Creator</h1>
              <p className="text-muted-foreground">Generate professional LinkedIn posts</p>
            </div>
            <div className="flex items-center gap-2">
              {isLinkedInConnected ? (
                <Badge variant="default" className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-500 border-red-500">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkedInAuth}
                disabled={isConnecting}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {isConnecting ? "Connecting..." : isLinkedInConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Post Topic *
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Leadership, Remote Work, Industry Trends"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Post Type
              </Label>
              <Select value={formData.postType} onValueChange={(value) => setFormData({ ...formData, postType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone & Style</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Industry/Field
              </Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Marketing, Finance"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Key Message</Label>
              <Textarea
                id="message"
                placeholder="What's the main point you want to convey?"
                value={formData.keyMessage}
                onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Content Options</Label>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={formData.includeHashtags ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeHashtags: !formData.includeHashtags })}
                >
                  Include Hashtags
                </Badge>
                <Badge 
                  variant={formData.includeCallToAction ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeCallToAction: !formData.includeCallToAction })}
                >
                  Call to Action
                </Badge>
              </div>
            </div>

            {/* Title Box */}
            {generatedContent && (
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Post Title
                </Label>
                <Input
                  id="title"
                  placeholder="Auto-generated title will appear here"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={!formData.topic || isGenerating}
              className="w-full btn-glow-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate LinkedIn Post"}
            </Button>

            {/* Download Content Button */}
            {generatedContent && (
              <Button 
                onClick={handleDownloadContent}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Content
              </Button>
            )}

            {/* Copy to Scheduler Button */}
            {generatedContent && (
              <Button 
                onClick={handleCopyToScheduler}
                variant="outline"
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Copy to Scheduler
              </Button>
            )}

            {/* Image Generation Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Generate Professional Image</h3>
              
              <div className="space-y-2">
                <Label>Image Style</Label>
                <Select value={selectedImageStyle} onValueChange={setSelectedImageStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image style" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateImage}
                disabled={!formData.topic || isGeneratingImage}
                variant="outline"
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {isGeneratingImage ? "Generating Image..." : "Generate Image"}
              </Button>

              {generatedImage && (
                <div className="space-y-3">
                  <img 
                    src={generatedImage} 
                    alt="Generated LinkedIn post" 
                    className="w-full rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDownloadImage}
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => setGeneratedImage("")}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="w-1/2">
        <ContentEditor 
          content={generatedContent}
          isGenerating={isGenerating}
          placeholder="Your LinkedIn post will appear here once generated..."
          title="LinkedIn Post"
          platform="linkedin"
          imageUrl={generatedImage}
        />
      </div>
    </div>
  )
}