import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { Link as LinkIcon, Sparkles, Globe, FileText, AlertCircle } from "lucide-react"
import { AIService } from "@/services/aiService"
import { toast } from "sonner"

const outputFormats = [
  { value: "tweet", label: "Twitter Thread" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "pinterest", label: "Pinterest Description" },
  { value: "summary", label: "Quick Summary" },
  { value: "blog", label: "Blog Post" },
  { value: "newsletter", label: "Newsletter Content" }
]

export default function Summarizer() {
  const [formData, setFormData] = useState({
    url: "",
    outputFormat: "",
    tone: "professional",
    includeHashtags: true,
    includeKeyPoints: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(true)

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, url });
    if (url) {
      setIsValidUrl(validateUrl(url));
    } else {
      setIsValidUrl(true);
    }
  }

  const handleGenerate = async () => {
    if (!formData.url) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!formData.outputFormat) {
      toast.error("Please select an output format");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await AIService.summarizeURL(
        formData.url, 
        formData.outputFormat, 
        {
          includeHashtags: formData.includeHashtags,
          includeKeyPoints: formData.includeKeyPoints
        }
      );
      
      setGeneratedContent(content);
      toast.success("Content summarized successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to summarize URL");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleClear = () => {
    setFormData({
      url: "",
      outputFormat: "",
      tone: "professional",
      includeHashtags: true,
      includeKeyPoints: true
    });
    setGeneratedContent("");
    setIsValidUrl(true);
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-gradient">URL Summarizer</h1>
              <p className="text-muted-foreground">Transform articles into social content</p>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Article URL *
              </Label>
              <Input
                id="url"
                placeholder="https://example.com/article"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={!isValidUrl && formData.url ? "border-red-500" : ""}
              />
              {!isValidUrl && formData.url && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  Please enter a valid URL
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Output Format *
              </Label>
              <Select value={formData.outputFormat} onValueChange={(value) => setFormData({ ...formData, outputFormat: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
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
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
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
                  variant={formData.includeKeyPoints ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeKeyPoints: !formData.includeKeyPoints })}
                >
                  Key Points
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleGenerate}
                disabled={!formData.url || !isValidUrl || !formData.outputFormat || isGenerating}
                className="flex-1 btn-glow-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Summarizing..." : "Generate Summary"}
              </Button>
              
              <Button 
                onClick={handleClear}
                variant="outline"
                disabled={isGenerating}
              >
                Clear
              </Button>
            </div>

            {/* Tips Section */}
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">💡 Tips for Better Results</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use articles from reputable sources for better accuracy</li>
                <li>• Longer articles provide more content to work with</li>
                <li>• Choose the output format that matches your platform</li>
                <li>• Adjust tone based on your target audience</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <div className="w-1/2">
        <ContentEditor 
          content={generatedContent}
          isGenerating={isGenerating}
          placeholder="Your article summary will appear here once generated..."
          title="Article Summary"
          platform="summary"
        />
      </div>
    </div>
  )
}