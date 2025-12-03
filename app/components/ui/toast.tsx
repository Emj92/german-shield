'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error'
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remove nach duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function Toast({ title, description, type = 'success', onClose }: ToastProps & { onClose: () => void }) {
  const bgColor = type === 'success' ? 'bg-[#22D6DD]' : 'bg-[#F06292]'
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div
      className={`${bgColor} text-white rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300`}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

