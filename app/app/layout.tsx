import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { ToastProvider } from '@/components/ui/toast'
import { ClientWrapper } from '@/components/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GermanFence Portal',
  description: 'Admin & User Portal für GermanFence WordPress Plugin',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/germanfence_icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#FAFAFA] dark:bg-[#1D2327]`}>
        <div className="animated-background" />
        <ThemeProvider>
          <ToastProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
