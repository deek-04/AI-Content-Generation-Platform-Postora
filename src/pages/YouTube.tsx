import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { Youtube, Sparkles, Video, Clock, Target } from "lucide-react"

const videoTypes = [
  { value: "shorts", label: "YouTube Shorts" },
  { value: "reel", label: "Instagram Reel" },
  { value: "tiktok", label: "TikTok Video" }
]

const durations = [
  { value: "15", label: "15 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "60 seconds" }
]

export default function YouTube() {
  const [formData, setFormData] = useState({
    topic: "",
    videoType: "",
    duration: "",
    targetAudience: "",
    callToAction: "",
    includeHooks: true,
    includeThumbnail: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(`🎬 YouTube Shorts Script: ${formData.topic}

📌 HOOK (0-3 seconds):
"Did you know that ${formData.topic} can change your life in just ${formData.duration} seconds?"

🎯 MAIN CONTENT (3-${parseInt(formData.duration || '30') - 5} seconds):
[Opening scene] Show the problem/situation
[Quick transition] Introduce the solution about ${formData.topic}
[Visual demonstration] Step-by-step breakdown
[Results/Benefits] What viewers can expect

💥 CALL TO ACTION (Last 5 seconds):
${formData.callToAction || `"Follow for more ${formData.topic} tips!"`}

📝 THUMBNAIL IDEAS:
- Bold text: "${formData.topic} in ${formData.duration}s!"
- Bright background with contrasting colors
- Your face showing excitement/surprise
- Visual element related to ${formData.topic}

#${formData.topic?.replace(/\s+/g, '')} #YouTubeShorts #viral #trending`)
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-gradient">YouTube Shorts Creator</h1>
              <p className="text-muted-foreground">Generate viral short-form video content</p>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Topic *
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Productivity Hacks, Quick Recipes, Life Tips"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Type
              </Label>
              <Select value={formData.videoType} onValueChange={(value) => setFormData({ ...formData, videoType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  {videoTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Audience
              </Label>
              <Input
                id="audience"
                placeholder="e.g., Gen Z, Entrepreneurs, Students"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action</Label>
              <Textarea
                id="cta"
                placeholder="What should viewers do after watching?"
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Content Options</Label>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={formData.includeHooks ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeHooks: !formData.includeHooks })}
                >
                  Include Hooks
                </Badge>
                <Badge 
                  variant={formData.includeThumbnail ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeThumbnail: !formData.includeThumbnail })}
                >
                  Thumbnail Ideas
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!formData.topic || isGenerating}
              className="w-full btn-glow-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Video Script"}
            </Button>
          </Card>
        </div>
      </div>

      <div className="w-1/2">
        <ContentEditor 
          content={generatedContent}
          isGenerating={isGenerating}
          placeholder="Your video script and thumbnail ideas will appear here..."
        />
      </div>
    </div>
  )
}