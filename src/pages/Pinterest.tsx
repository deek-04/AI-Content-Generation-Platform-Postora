import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { Sparkles, Image as ImageIcon, Type, Palette, Download, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react"
import { BrandPinterest as PinterestIcon } from "tabler-icons-react"
import { AIService } from "@/services/aiService"
import { useSocialMedia } from "@/contexts/SocialMediaContext"
import { toast } from "sonner"

const postTypes = [
  { value: "pin", label: "Regular Pin" },
  { value: "idea", label: "Idea Pin" },
  { value: "video", label: "Video Pin" },
  { value: "shopping", label: "Shopping Pin" }
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

export default function Pinterest() {
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
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [selectedImageStyle, setSelectedImageStyle] = useState("")
  const [imageLink, setImageLink] = useState("") // Added for image link
  
  const isPinterestConnected = getConnectionStatus('pinterest');

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await AIService.generateContent({
        topic: formData.topic,
        platform: 'pinterest',
        tone: formData.tone || 'casual',
        targetAudience: formData.targetAudience,
        keywords: formData.keywords,
        postType: formData.postType || 'pin',
        includeHashtags: formData.includeHashtags,
        includeEmojis: formData.includeEmojis
      });
      
      setGeneratedContent(content);
      
      // Generate title automatically
      try {
        const title = await AIService.generateTitle(content, 'pinterest');
        setGeneratedTitle(title);
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        // Don't show error toast for title generation failure
      }
      
      toast.success("Pinterest content generated successfully!");
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
      const prompt = `Pinterest pin image about ${formData.topic}, ${selectedImageStyle || 'modern'} style, high quality, engaging, social media optimized`;
      
      const imageUrl = await AIService.generateImage({
        prompt,
        platform: 'pinterest',
        style: selectedImageStyle || 'modern',
        aspectRatio: '2:3'
      });
      
      setGeneratedImage(imageUrl);
      // Set the image link for the editor
      setImageLink(imageUrl);
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
      link.download = `pinterest-${formData.topic.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    }
  }

  const handleCopyToScheduler = () => {
    if (generatedContent) {
      copyContentToScheduler(generatedContent, generatedImage, 'pinterest', generatedTitle);
    } else {
      toast.error("No content to copy to scheduler");
    }
  }

  return (
    <div className="h-svh flex animate-fadeIn">
      {/* Left Side - Input Form */}
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <PinterestIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-orbitron font-bold text-gradient">Pinterest Creator</h1>
              <p className="text-muted-foreground">Generate engaging Pinterest content with AI</p>
            </div>
            <div className="flex items-center gap-2">
              {isPinterestConnected && (
                <Badge variant="default" className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </div>

          <Card className="p-6 space-y-6 animate-slideInUp">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content Topic *
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Home Decor, DIY Projects, Recipe Ideas"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {/* Post Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Pin Type
              </Label>
              <Select value={formData.postType} onValueChange={(value) => setFormData({ ...formData, postType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pin type" />
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
              <Label htmlFor="audience" className="flex items-center gap-2">
                Target Audience (Optional)
              </Label>
              <Input
                id="audience"
                placeholder="e.g., DIY enthusiasts, home decorators"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords" className="flex items-center gap-2">
                Keywords (Optional)
              </Label>
              <Input
                id="keywords"
                placeholder="e.g., decor, DIY, crafts"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
            </div>

            {/* Generate Button */}
            {/* Title Box */}
            {generatedContent && (
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Pin Title
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
              className="w-full" 
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Pinterest Content
                </>
              )}
            </Button>
          </Card>

          {/* Image Generation */}
          <Card className="p-6 space-y-6 animate-slideInUp animation-delay-300">
            <h2 className="text-xl font-semibold">Generate Pin Image</h2>
            
            {/* Image Style */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Image Style
              </Label>
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

            {/* Generate Image Button */}
            <Button 
              onClick={handleGenerateImage} 
              variant="outline" 
              className="w-full" 
              disabled={isGeneratingImage}
              size="lg"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Pin Image
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>

      {/* Right Side - Generated Content */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Generated Pinterest Content</h2>
          
          {/* Content Editor */}
          <Card className="p-6 space-y-6 animate-slideInUp animation-delay-500">
            <h3 className="font-semibold text-lg">Generated Content</h3>
            <ContentEditor 
              content={generatedContent} 
              onChange={setGeneratedContent}
              platform="pinterest"
              title="Pinterest Description"
              imageUrl={generatedImage}
              imageLink={imageLink}
            />
          </Card>

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Image</h3>
              <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto border rounded-lg overflow-hidden">
                <img 
                  src={generatedImage} 
                  alt="Generated Pinterest image" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadImage} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            </div>
          )}

          {/* Copy to Scheduler */}
          <div className="pt-4">
            <Button 
              onClick={handleCopyToScheduler} 
              disabled={!generatedContent}
              className="w-full"
              size="lg"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Copy to Scheduler
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}