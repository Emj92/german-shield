'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'ticket_response' | 'license_expiry' | 'system' | 'MESSAGE' | 'UPDATE' | 'NEWS' | 'WARNING'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  backgroundColor?: string
}

interface ConfirmDialog {
  show: boolean
  title: string
  message: string
  onConfirm: () => void
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({ show: false, title: '', message: '', onConfirm: () => {} })
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Client-side mounting für Portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load notifications
  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedNotification(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch('/api/notifications/read', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
      setSelectedNotification(null)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  function showClearConfirm() {
    setConfirmDialog({
      show: true,
      title: 'Alle löschen?',
      message: 'Möchtest du alle Benachrichtigungen unwiderruflich löschen?',
      onConfirm: async () => {
        try {
          await fetch('/api/notifications/clear', {
            method: 'DELETE'
          })
          setNotifications([])
        } catch (error) {
          console.error('Failed to clear notifications:', error)
        }
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })
      }
    })
  }

  // Bestimme Hintergrundfarbe basierend auf Typ
  function getNotificationBgColor(notification: Notification): string {
    if (notification.backgroundColor) {
      // Warning = rosa, andere = türkis
      if (notification.type === 'WARNING' || notification.backgroundColor === '#EC4899') {
        return 'bg-[#EC4899]/10 border-l-4 border-l-[#EC4899]'
      }
      return 'bg-[#22D6DD]/10 border-l-4 border-l-[#22D6DD]'
    }
    
    switch (notification.type) {
      case 'WARNING':
      case 'license_expiry':
        return 'bg-[#EC4899]/10 border-l-4 border-l-[#EC4899]'
      default:
        return 'bg-[#22D6DD]/10 border-l-4 border-l-[#22D6DD]'
    }
  }

  // Punkt-Farbe für ungelesene
  function getDotColor(notification: Notification): string {
    if (notification.type === 'WARNING' || notification.backgroundColor === '#EC4899') {
      return 'bg-[#EC4899]'
    }
    return 'bg-[#22D6DD]'
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `vor ${minutes} Min.`
    if (hours < 24) return `vor ${hours} Std.`
    if (days < 7) return `vor ${days} Tagen`
    return date.toLocaleDateString('de-DE')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 h-9 w-9 border-[#d9dde1] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-[#D81B60] rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1F23] border border-[#d9dde1] dark:border-slate-700 rounded-[9px] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#d9dde1] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Benachrichtigungen</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={showClearConfirm}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Alle löschen"
                >
                  <Trash2 className="h-4 w-4 text-slate-500 hover:text-[#EC4899]" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Keine Benachrichtigungen</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id)
                    setSelectedNotification(notification)
                  }}
                  className={`px-4 py-3 border-b border-[#d9dde1] dark:border-slate-700 cursor-pointer hover:bg-[#F2F5F8] dark:hover:bg-slate-800 transition-colors ${
                    !notification.read ? getNotificationBgColor(notification) : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <Bell className="h-5 w-5 text-[#22D6DD] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className={`h-2 w-2 rounded-full ${getDotColor(notification)} flex-shrink-0 mt-1.5`} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Popup für ausgewählte Benachrichtigung - via Portal für korrekte Zentrierung */}
      {mounted && selectedNotification && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setSelectedNotification(null)}>
          <div 
            className="bg-white dark:bg-[#1A1F23] rounded-[9px] w-full max-w-md mx-4 shadow-2xl border border-[#d9dde1] dark:border-slate-700 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className={`px-5 py-4 ${
              selectedNotification.type === 'WARNING' || selectedNotification.backgroundColor === '#EC4899'
                ? 'bg-[#EC4899]/10'
                : 'bg-[#22D6DD]/10'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Bell className={`h-6 w-6 ${
                    selectedNotification.type === 'WARNING' || selectedNotification.backgroundColor === '#EC4899'
                      ? 'text-[#EC4899]'
                      : 'text-[#22D6DD]'
                  }`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedNotification.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Popup Body */}
            <div className="px-5 py-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                {formatTime(selectedNotification.createdAt)}
              </p>
            </div>

            {/* Popup Footer */}
            <div className="px-5 py-3 bg-[#FAFAFA] dark:bg-slate-800 border-t border-[#d9dde1] dark:border-slate-700 flex justify-between">
              <Button
                size="sm"
                onClick={() => deleteNotification(selectedNotification.id)}
                className="bg-[#EC4899] text-white border-none hover:bg-[#EC4899] hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 mr-2 text-white" />
                Löschen
              </Button>
              {selectedNotification.link && (
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = selectedNotification.link!
                    setSelectedNotification(null)
                  }}
                  className="bg-[#22D6DD] hover:bg-[#22D6DD]/90"
                >
                  Öffnen
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Eigener Confirm-Dialog statt Browser-Confirm - via Portal */}
      {mounted && confirmDialog.show && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-[#1A1F23] rounded-[9px] w-full max-w-sm mx-4 shadow-2xl border border-[#d9dde1] dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d9dde1] dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{confirmDialog.title}</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-gray-600 dark:text-gray-300">{confirmDialog.message}</p>
            </div>
            <div className="px-5 py-3 bg-[#F2F5F8] dark:bg-slate-800 border-t border-[#d9dde1] dark:border-slate-700 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })}
              >
                Nein
              </Button>
              <Button
                size="sm"
                onClick={confirmDialog.onConfirm}
                className="bg-[#EC4899] hover:bg-[#EC4899]/90"
              >
                Ja
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
