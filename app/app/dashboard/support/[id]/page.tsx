'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, User, Shield, Upload, X, FileImage } from 'lucide-react'

interface TicketResponse {
  id: string
  message: string
  isAdmin: boolean
  createdAt: string
  authorId: string
  attachmentUrl?: string
  attachmentName?: string
}

interface Ticket {
  id: string
  subject: string
  message: string
  category: string
  status: string
  createdAt: string
  responses: TicketResponse[]
  attachmentUrl?: string
  attachmentName?: string
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`)
      if (res.status === 404) {
        router.push('/dashboard/support')
        return
      }
      const data = await res.json()
      setTicket(data)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    // Get user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error)
    
    fetchTicket()
  }, [fetchTicket])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)
    
    if (!file) return
    
    // Erlaubte Typen: png, jpg, jpeg, webp
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Nur PNG, JPG, JPEG und WEBP erlaubt')
      return
    }
    
    // Max 2MB für Kunden
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Maximale Dateigröße: 2MB')
      return
    }
    
    setSelectedFile(file)
  }

  const sendReply = async () => {
    if (!newMessage.trim() && !selectedFile) return
    
    setSending(true)
    try {
      let attachmentUrl = null
      let attachmentName = null
      
      // Datei hochladen falls vorhanden
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          attachmentUrl = uploadData.url
          attachmentName = selectedFile.name
        }
      }
      
      const res = await fetch(`/api/support/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMessage.trim(),
          attachmentUrl,
          attachmentName
        })
      })
      
      if (res.ok) {
        setNewMessage('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        fetchTicket()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING: 'bg-purple-100 text-purple-800',
      CLOSED: 'bg-green-100 text-green-800',
    }
    const labels: Record<string, string> = {
      OPEN: 'Offen',
      IN_PROGRESS: 'In Bearbeitung',
      WAITING: 'Wartet',
      CLOSED: 'Geschlossen',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.OPEN}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      FEHLER: '🐛 Fehler',
      VORSCHLAG: '💡 Vorschlag',
      HILFE: '🤝 Hilfe',
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <DashboardLayout user={user || { email: '', role: 'USER' }}>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22D6DD]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout user={user || { email: '', role: 'USER' }}>
        <div className="p-12">
          <p>Ticket nicht gefunden</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user || { email: '', role: 'USER' }}>
      <div className="p-12 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/support')}
            className="hover:bg-transparent hover:text-inherit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{getCategoryLabel(ticket.category)}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </CardDescription>
              </div>
              {getStatusBadge(ticket.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-[#F2F5F8] p-4 rounded-[9px]">
              <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        {ticket.responses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Antworten ({ticket.responses.length})</h3>
            {ticket.responses.map((response) => (
              <Card key={response.id} className={response.isAdmin ? 'border-[#22D6DD]' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${response.isAdmin ? 'bg-[#22D6DD]/10' : 'bg-slate-100'}`}>
                      {response.isAdmin ? (
                        <Shield className="h-4 w-4 text-[#22D6DD]" />
                      ) : (
                        <User className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {response.isAdmin ? 'GermanFence Support' : 'Sie'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                      
                      {/* Anhang anzeigen */}
                      {response.attachmentUrl && (
                        <div className="mt-3 p-3 bg-[#F2F5F8] rounded-[9px] border border-[#d9dde1]">
                          <a 
                            href={response.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#22D6DD] hover:underline"
                          >
                            <FileImage className="h-4 w-4" />
                            <span className="text-sm">{response.attachmentName || 'Anhang öffnen'}</span>
                          </a>
                          {/* Bild-Vorschau */}
                          {response.attachmentUrl.match(/\.(png|jpg|jpeg|webp|gif)$/i) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={response.attachmentUrl} 
                              alt={response.attachmentName || 'Anhang'}
                              className="mt-2 max-w-full max-h-64 rounded-[9px] object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Antworten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ihre Nachricht..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                className="border-[#d9dde1] focus:border-[#22D6DD] focus:ring-[#22D6DD]"
              />
              
              {/* Datei-Upload */}
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#d9dde1]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bild anhängen
                </Button>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 bg-[#F2F5F8] px-3 py-2 rounded-[9px]">
                    <FileImage className="h-4 w-4 text-[#22D6DD]" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {uploadError && (
                  <span className="text-red-500 text-sm">{uploadError}</span>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Erlaubt: PNG, JPG, JPEG, WEBP (max. 2MB)
              </p>
              
              <Button 
                onClick={sendReply}
                disabled={sending || (!newMessage.trim() && !selectedFile)}
                className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Senden
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

