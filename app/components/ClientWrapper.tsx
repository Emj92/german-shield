'use client'

import { CookieBanner } from './CookieBanner'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieBanner />
    </>
  )
}

