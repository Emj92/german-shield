'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  FileText,
  Download,
  MessageSquare,
  Settings,
  LogOut,
  Moon,
  Sun,
  Key,
  UserCog,
  Megaphone,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'

interface AppSidebarProps {
  user: {
    userId?: string
    id?: string
    email: string
    name?: string | null
    role: string
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  // User-Navigation
  const userNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lizenzen', href: '/dashboard/licenses', icon: Key },
    { name: 'Rechnungen & Abos', href: '/dashboard/invoices', icon: FileText },
    { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
    { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
    { name: 'Einstellungen', href: '/dashboard/settings', icon: Settings },
  ]

  // Admin-zusätzliche Navigation
  const adminNav = [
    { name: 'Benutzerverwaltung', href: '/dashboard/admin/users', icon: UserCog },
    { name: 'Lizenzverwaltung', href: '/dashboard/admin/licenses', icon: Key },
    { name: 'Support-Tickets', href: '/dashboard/admin/tickets', icon: MessageSquare },
    { name: 'Infoleisten', href: '/dashboard/admin/infobanner', icon: Megaphone },
    { name: 'Einstellungen', href: '/dashboard/admin/settings', icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-[#d9dde1]" style={{ height: '4.3rem' }}>
        <div className="flex items-center justify-center px-4 h-full">
          <Image 
            src="/germanfence_icon.png" 
            alt="GermanFence" 
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {userNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {user.role === 'ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin-Bereich</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#d9dde1]">
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{user.email}</span>
              <span className="text-xs text-muted-foreground">
                {user.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              className="flex-1 flex items-center justify-center p-2 text-sidebar-foreground"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <form action="/api/auth/logout" method="POST" className="flex-1">
              <Button 
                size="sm" 
                className="w-full bg-[#22D6DD] text-white hover:bg-[#22D6DD] border-0 transition-transform hover:-translate-y-0.5" 
                type="submit"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
