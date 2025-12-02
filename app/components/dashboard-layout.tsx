'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    email: string
    role: 'ADMIN' | 'USER'
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

