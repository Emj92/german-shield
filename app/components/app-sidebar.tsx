'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Download,
  MessageSquare,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Shield,
  Moon,
  Sun,
  Key,
  UserCog,
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
import { useTheme } from '@/lib/theme-provider'

interface AppSidebarProps {
  user: {
    email: string
    role: 'ADMIN' | 'USER'
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  // User-Navigation
  const userNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lizenzen', href: '/dashboard/licenses', icon: Key },
    { name: 'Rechnungen', href: '/dashboard/invoices', icon: FileText },
    { name: 'Downloads', href: '/dashboard/downloads', icon: Download },
    { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
    { name: 'News', href: '/dashboard/news', icon: Newspaper },
  ]

  // Admin-zusätzliche Navigation
  const adminNav = [
    { name: 'Benutzerverwaltung', href: '/dashboard/admin/users', icon: UserCog },
    { name: 'Lizenzverwaltung', href: '/dashboard/admin/licenses', icon: Key },
    { name: 'Support-Tickets', href: '/dashboard/admin/tickets', icon: MessageSquare },
    { name: 'News-Verwaltung', href: '/dashboard/admin/news', icon: Newspaper },
    { name: 'Einstellungen', href: '/dashboard/admin/settings', icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">German Fence</span>
            <span className="text-xs text-muted-foreground">
              {user.role === 'ADMIN' ? 'Admin-Portal' : 'User-Portal'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
              <SidebarMenu>
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

      <SidebarFooter className="border-t border-sidebar-border">
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
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <form action="/api/auth/logout" method="POST" className="flex-1">
              <Button variant="outline" size="sm" className="w-full" type="submit">
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
