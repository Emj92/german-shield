'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
        <main className="flex-1 overflow-auto relative z-10">
          {/* Top Bar mit Sprachumschalter - Höhe 4.3rem wie Sidebar */}
          <div className="flex justify-end items-center px-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20" style={{ height: '4.3rem' }}>
            <LanguageSwitcher />
          </div>
          
          <div className="p-8">
            <div className="bg-white rounded-lg border border-gray-200 min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

