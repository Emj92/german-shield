'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { InfoBanner } from '@/components/info-banner'

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
      <div className="flex min-h-screen w-full relative overflow-hidden bg-background">
        <AnimatedBackground />
        <AppSidebar user={user} />
        <main className="flex-1 overflow-auto relative z-10">
          {/* Info Banner */}
          <InfoBanner target="portal" />
          
          {/* Top Bar mit Download + Sprachumschalter - Höhe 4.3rem wie Sidebar */}
          <div className="flex justify-end items-center gap-3 px-6 border-b border-[#d9dde1] dark:border-slate-700 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-20" style={{ height: '4.3rem' }}>
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
              <Button size="sm" className="bg-[#22D6DD] hover:bg-[#22D6DD] text-white">
                <Download className="mr-2 h-4 w-4" />
                Plugin Download
              </Button>
            </a>
            <LanguageSwitcher />
          </div>
          
          <div className="p-8">
            <div className="bg-white dark:bg-slate-900 rounded-[9px] border border-[#d9dde1] dark:border-slate-700 min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

