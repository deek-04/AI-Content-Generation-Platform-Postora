import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { Instagram as InstagramIcon, Sparkles, Image as ImageIcon, Type, Palette, Download, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react"
import { AIService } from "@/services/aiService"
import { useSocialMedia } from "@/contexts/SocialMediaContext"
import { toast } from "sonner"

const postTypes = [
  { value: "post", label: "Regular Post" },
  { value: "story", label: "Story" },
  { value: "carousel", label: "Carousel" },
  { value: "reel", label: "Reel" }
]

const tones = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "funny", label: "Funny" },
  { value: "inspirational", label: "Inspirational" },
  { value: "educational", label: "Educational" }
]

const imageStyles = [
  { value: "modern", label: "Modern & Clean" },
  { value: "vintage", label: "Vintage & Retro" },
  { value: "minimalist", label: "Minimalist" },
  { value: "bold", label: "Bold & Colorful" },
  { value: "elegant", label: "Elegant & Sophisticated" }
]

export default function Instagram() {
  const { getConnectionStatus, copyContentToScheduler } = useSocialMedia();
  const [formData, setFormData] = useState({
    topic: "",
    postType: "",
    tone: "",
    targetAudience: "",
    keywords: "",
    includeHashtags: true,
    includeEmojis: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [selectedImageStyle, setSelectedImageStyle] = useState("")
  
  const isInstagramConnected = getConnectionStatus('instagram');

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await AIService.generateContent({
        topic: formData.topic,
        platform: 'instagram',
        tone: formData.tone || 'casual',
        targetAudience: formData.targetAudience,
        keywords: formData.keywords,
        postType: formData.postType || 'post',
        includeHashtags: formData.includeHashtags,
        includeEmojis: formData.includeEmojis
      });
      
      setGeneratedContent(content);
      toast.success("Instagram content generated successfully!");
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
      const prompt = `Instagram post image about ${formData.topic}, ${selectedImageStyle || 'modern'} style, high quality, engaging, social media optimized`;
      
      const imageUrl = await AIService.generateImage({
        prompt,
        platform: 'instagram',
        style: selectedImageStyle || 'modern',
        aspectRatio: '1:1'
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
      link.download = `instagram-${formData.topic.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    }
  }

  const handleCopyToScheduler = () => {
    if (generatedContent) {
      copyContentToScheduler(generatedContent, generatedImage, 'instagram');
    } else {
      toast.error("No content to copy to scheduler");
    }
  }

  return (
    <div className="h-screen flex">
      {/* Left Side - Input Form */}
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
              <InstagramIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-orbitron font-bold text-gradient">Instagram Creator</h1>
              <p className="text-muted-foreground">Generate engaging Instagram content with AI</p>
            </div>
            <div className="flex items-center gap-2">
              {isInstagramConnected ? (
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
            </div>
          </div>

          <Card className="p-6 space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content Topic *
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Digital Marketing, Fitness Tips, Cooking"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {/* Post Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
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

            {/* Tone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tone & Style
              </Label>
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

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Young professionals, Fitness enthusiasts"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Textarea
                id="keywords"
                placeholder="e.g., motivation, success, productivity"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                rows={3}
              />
            </div>

            {/* Options */}
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
                  variant={formData.includeEmojis ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeEmojis: !formData.includeEmojis })}
                >
                  Include Emojis
                </Badge>
              </div>
            </div>

            {/* Generate Content Button */}
            <Button 
              onClick={handleGenerate}
              disabled={!formData.topic || isGenerating}
              className="w-full btn-glow-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Instagram Content"}
            </Button>

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
              <h3 className="font-semibold text-lg">Generate Matching Image</h3>
              
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
                    alt="Generated Instagram post" 
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

      {/* Right Side - Content Editor */}
      <div className="w-1/2">
        <ContentEditor 
          content={generatedContent}
          isGenerating={isGenerating}
          placeholder="Your Instagram content will appear here once generated..."
          title="Instagram Content"
          platform="instagram"
          imageUrl={generatedImage}
        />
      </div>
    </div>
  )
}