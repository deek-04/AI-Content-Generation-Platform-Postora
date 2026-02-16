import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Rocket, 
  Youtube, 
  PenTool, 
  Calendar,
  Link,
  Linkedin,
  Stars,
  Brain,
  Target,
  Play,
  X
} from "lucide-react"
import { BrandPinterest } from "tabler-icons-react"
import { Link as RouterLink } from "react-router-dom"
import heroImage from "@/assets/hero-bg.jpg"

const features = [
  {
    icon: BrandPinterest,
    title: "Pinterest Creator",
    description: "Generate stunning Pinterest pins and boards with AI-powered visuals and descriptions.",
    gradient: "from-red-500 to-red-700",
    link: "/pinterest"
  },
  {
    icon: Youtube,
    title: "YouTube Shorts",
    description: "Create viral YouTube Shorts and Instagram Reels with AI-generated scripts and thumbnails.",
    gradient: "from-red-500 to-pink-500",
    link: "/youtube"
  },
  {
    icon: PenTool,
    title: "Blog Content",
    description: "Write engaging blog posts with AI assistance, complete with SEO optimization and featured images.",
    gradient: "from-blue-500 to-cyan-500",
    link: "/blog"
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description: "Schedule your content across all platforms with our intuitive drag-and-drop calendar interface.",
    gradient: "from-green-500 to-teal-500",
    link: "/scheduler"
  },
  {
    icon: Link,
    title: "URL Summarizer",
    description: "Transform any article or webpage into engaging social media content in seconds.",
    gradient: "from-orange-500 to-yellow-500",
    link: "/summarizer"
  },
  {
    icon: Linkedin,
    title: "LinkedIn Posts",
    description: "Create professional LinkedIn content that drives engagement and builds your network.",
    gradient: "from-blue-600 to-indigo-600",
    link: "/linkedin"
  }
]

const stats = [
  { number: "50K+", label: "Content Pieces Generated" },
  { number: "10K+", label: "Active Creators" },
  { number: "98%", label: "Satisfaction Rate" },
  { number: "24/7", label: "AI Availability" }
]

const Index = () => {
  const [showDemo, setShowDemo] = useState(false)

  const handleWatchDemo = () => {
    setShowDemo(true)
  }

  const closeDemo = () => {
    setShowDemo(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 animate-[float_20s_ease-in-out_infinite]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-primary/10 animate-[float_15s_ease-in-out_infinite_reverse]" />
        
        {/* Multiple Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-[bounce_3s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-20 w-6 h-6 bg-secondary rounded-full animate-[float_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-32 left-20 w-5 h-5 bg-accent rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="absolute top-60 left-1/4 w-3 h-3 bg-primary/60 rounded-full animate-[bounce_5s_ease-in-out_infinite_0.5s]" />
        <div className="absolute bottom-20 right-1/3 w-7 h-7 bg-secondary/70 rounded-full animate-[float_6s_ease-in-out_infinite_1s]" />
        <div className="absolute top-32 right-10 w-4 h-4 bg-accent/80 rounded-full animate-[pulse_3.5s_ease-in-out_infinite_1.5s]" />
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-primary/50 rounded-full animate-[bounce_4.5s_ease-in-out_infinite_2s]" />
        <div className="absolute top-80 right-1/4 w-6 h-6 bg-secondary/60 rounded-full animate-[float_7s_ease-in-out_infinite_2.5s]" />
        
        {/* Animated Geometric Shapes */}
        <div className="absolute top-16 left-1/2 w-8 h-8 border-2 border-primary/40 rotate-45 animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-16 right-1/2 w-12 h-12 border-2 border-secondary/30 animate-[spin_25s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-16 w-6 h-6 border-2 border-accent/50 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-16 w-10 h-10 border border-primary/20 rotate-12 animate-[float_8s_ease-in-out_infinite]" />
        
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <Badge variant="outline" className="mb-6 bg-primary/10 border-primary/20 text-primary animate-fade-in-scale">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Content Creation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 text-gradient animate-slide-in-up">
            Create Viral Content
            <br />
            <span className="text-glow">with AI Magic</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            Transform your social media presence with our AI-powered content creation studio. 
            Generate engaging posts, stunning visuals, and viral content in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <Button asChild className="btn-hero group">
              <RouterLink to="/pinterest">
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass group"
              onClick={handleWatchDemo}
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-orbitron font-bold text-gradient mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 bg-secondary/10 border-secondary/20 text-secondary">
              <Brain className="w-4 h-4 mr-2" />
              Powerful AI Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-gradient">
              Everything You Need to
              <br />
              <span className="text-glow">Dominate Social Media</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive AI toolkit empowers creators, marketers, and businesses 
              to produce high-quality content that drives engagement and growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-feature group cursor-pointer">
                <RouterLink to={feature.link} className="block">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </RouterLink>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="card-glass p-12">
            <Rocket className="w-16 h-16 mx-auto mb-6 text-primary animate-pulse-glow" />
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-6 text-gradient">
              Ready to Go Viral?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using our AI-powered platform 
              to create content that captivates audiences and drives results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-glow-primary">
                <RouterLink to="/pinterest">
                  <Target className="w-5 h-5 mr-2" />
                  Start Your Journey
                </RouterLink>
              </Button>
              <Button variant="outline" className="btn-glass">
                <Stars className="w-5 h-5 mr-2" />
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-background rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={closeDemo}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">Postora Demo</h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Play className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Demo video will be inserted here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Path: /path/to/demo-video.mp4
                  </p>
                </div>
                {/* 
                Uncomment and update the path when you have the demo video:
                <video 
                  controls 
                  className="w-full h-full rounded-lg"
                  src="/path/to/demo-video.mp4"
                >
                  Your browser does not support the video tag.
                </video>
                */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
