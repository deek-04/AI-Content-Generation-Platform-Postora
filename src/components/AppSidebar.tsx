import { NavLink, useLocation } from "react-router-dom"
import { 
  Youtube, 
  PenTool, 
  Calendar, 
  Link, 
  Linkedin,
  Sparkles,
  Zap,
  Home
} from "lucide-react"
import { BrandPinterest } from "tabler-icons-react"
import {
  CustomSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Pinterest Creator", url: "/pinterest", icon: BrandPinterest },
  { title: "YouTube Shorts", url: "/youtube", icon: Youtube },
  { title: "Blog Content", url: "/blog", icon: PenTool },
  { title: "Post Scheduler", url: "/scheduler", icon: Calendar },
  { title: "URL Summarizer", url: "/summarizer", icon: Link },
  { title: "LinkedIn Posts", url: "/linkedin", icon: Linkedin },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary border-r-2 border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-all duration-300"

  return (
    <CustomSidebar
      className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl h-svh"
      collapsible={true}
    >
      <SidebarContent className="p-4">
        {/* Logo Section */}
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-orbitron font-bold text-gradient">ContentAI</h1>
                <p className="text-xs text-muted-foreground">AI Content Studio</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-orbitron tracking-wider uppercase text-xs">
            {!isCollapsed && "AI Tools"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 rounded-lg">
                    <NavLink to={item.url} end className={getNavClasses}>
                      <div className="flex items-center gap-3 w-full">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="font-medium truncate">{item.title}</span>
                        )}
                      </div>
                      {!isCollapsed && isActive(item.url) && (
                        <Zap className="w-4 h-4 ml-auto text-primary animate-pulse" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

  {/* ...removed Upgrade Section... */}
      </SidebarContent>
    </CustomSidebar>
  )
}