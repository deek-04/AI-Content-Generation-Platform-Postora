import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContentEditor } from "@/components/ContentEditor"
import { PenTool, Sparkles, FileText, Hash, Users } from "lucide-react"

const blogTypes = [
  { value: "how-to", label: "How-to Guide" },
  { value: "listicle", label: "Listicle" },
  { value: "review", label: "Product Review" },
  { value: "news", label: "News/Update" },
  { value: "opinion", label: "Opinion Piece" }
]

const wordCounts = [
  { value: "500", label: "500 words" },
  { value: "1000", label: "1000 words" },
  { value: "1500", label: "1500 words" },
  { value: "2000", label: "2000+ words" }
]

export default function Blog() {
  const [formData, setFormData] = useState({
    title: "",
    blogType: "",
    wordCount: "",
    targetKeywords: "",
    audience: "",
    outline: "",
    includeSEO: true,
    includeImages: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(`# ${formData.title || 'Your Blog Title'}

## Introduction
In today's digital landscape, understanding ${formData.targetKeywords?.split(',')[0]} has become crucial for ${formData.audience || 'professionals'}. This comprehensive guide will walk you through everything you need to know.

## Table of Contents
1. What is ${formData.targetKeywords?.split(',')[0]}?
2. Why it matters for ${formData.audience}
3. Step-by-step implementation
4. Common mistakes to avoid
5. Advanced tips and tricks
6. Conclusion

## Main Content

### Section 1: Understanding the Basics
${formData.targetKeywords?.split(',')[0]} is fundamentally about...

### Section 2: Practical Implementation
Here's how you can start implementing these strategies today:

1. **First Step**: Begin by analyzing your current situation
2. **Second Step**: Identify key areas for improvement
3. **Third Step**: Create an action plan
4. **Fourth Step**: Monitor and adjust

### Section 3: Pro Tips
- Always focus on quality over quantity
- Consistency is key to success
- Measure your results regularly
- Stay updated with latest trends

## Conclusion
By following these guidelines, you'll be well on your way to mastering ${formData.targetKeywords?.split(',')[0]}. Remember, success comes with practice and persistence.

---

**SEO Keywords**: ${formData.targetKeywords}
**Meta Description**: Learn everything about ${formData.targetKeywords?.split(',')[0]} in this comprehensive guide designed for ${formData.audience}.`)
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-gradient">Blog Content Creator</h1>
              <p className="text-muted-foreground">Generate SEO-optimized blog posts</p>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Blog Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., The Ultimate Guide to Digital Marketing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Blog Type
              </Label>
              <Select value={formData.blogType} onValueChange={(value) => setFormData({ ...formData, blogType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blog type" />
                </SelectTrigger>
                <SelectContent>
                  {blogTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Word Count</Label>
              <Select value={formData.wordCount} onValueChange={(value) => setFormData({ ...formData, wordCount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  {wordCounts.map((count) => (
                    <SelectItem key={count.value} value={count.value}>
                      {count.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Target Keywords
              </Label>
              <Textarea
                id="keywords"
                placeholder="e.g., digital marketing, SEO, content strategy"
                value={formData.targetKeywords}
                onChange={(e) => setFormData({ ...formData, targetKeywords: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Audience
              </Label>
              <Input
                id="audience"
                placeholder="e.g., Small business owners, Marketers"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outline">Content Outline (Optional)</Label>
              <Textarea
                id="outline"
                placeholder="Brief outline of main points to cover..."
                value={formData.outline}
                onChange={(e) => setFormData({ ...formData, outline: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Content Options</Label>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={formData.includeSEO ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeSEO: !formData.includeSEO })}
                >
                  SEO Optimization
                </Badge>
                <Badge 
                  variant={formData.includeImages ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, includeImages: !formData.includeImages })}
                >
                  Image Suggestions
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!formData.title || isGenerating}
              className="w-full btn-glow-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Blog Content"}
            </Button>
          </Card>
        </div>
      </div>

      <div className="w-1/2">
        <ContentEditor 
          content={generatedContent}
          isGenerating={isGenerating}
          placeholder="Your blog content will appear here once generated..."
        />
      </div>
    </div>
  )
}