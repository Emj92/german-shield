'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    email: string
    role: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative overflow-hidden bg-[#FAFAFA]">
        <AnimatedBackground />
        <AppSidebar user={user} />
        <main className="flex-1 overflow-auto relative z-10 p-12">
          <div className="bg-white rounded-lg border border-gray-200 min-h-[calc(100vh-6rem)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

