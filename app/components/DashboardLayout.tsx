'use client'

import { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    userId?: string
    id?: string
    email: string
    name?: string | null
    role: string
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative overflow-hidden">
        <AnimatedBackground />
        <AppSidebar user={user} />
        <main className="flex-1 overflow-auto relative z-10">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

export { DashboardLayout }
