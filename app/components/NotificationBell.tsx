'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'ticket_response' | 'license_expiry' | 'system'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

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

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST'
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'ticket_response':
        return '💬'
      case 'license_expiry':
        return '⚠️'
      case 'system':
        return '🔔'
      default:
        return '📌'
    }
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
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#22D6DD] hover:underline"
              >
                Alle gelesen
              </button>
            )}
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
                    if (notification.link) window.location.href = notification.link
                  }}
                  className={`px-4 py-3 border-b border-[#d9dde1] dark:border-slate-700 cursor-pointer hover:bg-[#F2F5F8] dark:hover:bg-slate-800 transition-colors ${
                    !notification.read ? 'bg-[#E9FBFC] dark:bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
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
                      <span className="h-2 w-2 rounded-full bg-[#22D6DD] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[#d9dde1] dark:border-slate-700 bg-[#F2F5F8] dark:bg-slate-800">
              <a
                href="/dashboard/notifications"
                className="text-xs text-[#22D6DD] hover:underline block text-center"
              >
                Alle Benachrichtigungen anzeigen
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

