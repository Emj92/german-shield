'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import { Download, ExternalLink, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    userId?: string
    id?: string
    email: string
    name?: string | null
    role: string
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Installationen', href: '/dashboard/installations', icon: '📦' },
    { name: 'Lizenzen', href: '/dashboard/licenses', icon: '🔑' },
    { name: 'Nutzer', href: '/dashboard/users', icon: '👥' },
    { name: 'Statistiken', href: '/dashboard/stats', icon: '📈' },
    { name: 'Einstellungen', href: '/dashboard/settings', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 z-40 h-screen bg-gray-800/50 backdrop-blur-sm border-r border-gray-700"
        style={{ width: '280px' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-8 px-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl mr-3">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">German Shield</h2>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="absolute bottom-4 left-0 right-0 px-6">
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-sm text-gray-400 hover:text-white transition py-2 px-3 rounded bg-gray-800 hover:bg-gray-700"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-[280px] transition-all">
        {/* Top Bar */}
        <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="https://germanfence.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Zur Website</span>
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {/* Download Button */}
              <Button
                asChild
                className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white"
              >
                <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
                  <Download className="mr-2 h-4 w-4" />
                  Plugin Download
                </a>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22D6DD]/20 border border-[#22D6DD]/30">
                      <User className="h-5 w-5 text-[#22D6DD]" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'Benutzer'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/licenses">Lizenzen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/support">Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'ADMIN' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-gray-700/50">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 German Shield. Alle Rechte vorbehalten.</p>
            <p className="mt-2">
              Erstellt mit <span className="text-cyan-400">♥</span> von{' '}
              <a
                href="https://www.meindl-webdesign.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                www.meindl-webdesign.de
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export { DashboardLayout }
