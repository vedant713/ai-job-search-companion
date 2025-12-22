import { Home, Settings, BarChart3, CheckSquare, Bot, Briefcase, User, LogOut, Search, Sparkles } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Applications",
    url: "/dashboard/applications",
    icon: Briefcase,
  },
  {
    title: "Job Recommendations",
    url: "/dashboard/job-recommendations",
    icon: Search,
  },
  {
    title: "Skill Map",
    url: "/dashboard/skills",
    icon: BarChart3,
  },
  {
    title: "To-Do",
    url: "/dashboard/todos",
    icon: CheckSquare,
  },
  {
    title: "AI Assistant",
    url: "/dashboard/ai-assistant",
    icon: Bot,
    glow: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <div className="flex h-full flex-col bg-background/50 backdrop-blur-xl border-r border-white/5 shadow-2xl">
        <SidebarHeader className="pt-6 pb-2 px-4">
          <div className="flex items-center gap-3 px-2 py-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/20 transition-all group-hover:shadow-primary/40 group-hover:scale-105">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                JobAI
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Companion
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className={`
                          h-11 rounded-lg transition-all duration-200
                          ${isActive
                            ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }
                          ${item.glow ? "ring-1 ring-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.15)]" : ""}
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                          <span className="text-sm">{item.title}</span>
                          {item.glow && (
                            <span className="ml-auto flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_currentColor]" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-white/10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">VD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Vedant Dhoke</span>
                      <span className="truncate text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl"
                >
                  <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  )
}
