'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, FileImage } from 'lucide-react'

export default function NewSupportTicketPage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<'FEHLER' | 'VORSCHLAG' | 'HILFE'>('HILFE')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Fehler zu Beginn zurücksetzen
    setError('')
    
    // Validiere Dateien
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 3 * 1024 * 1024) {
        setError(`Datei ${file.name} ist zu groß (max. 3MB)`)
        return false
      }
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        setError(`Datei ${file.name} hat ein ungültiges Format`)
        return false
      }
      return true
    })

    setFiles(prev => [...prev, ...validFiles].slice(0, 3))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('subject', subject)
      formData.append('category', category)
      formData.append('message', message)
      files.forEach(file => formData.append('files', file))

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Fehler beim Erstellen des Tickets')
      }

      router.push('/dashboard/support')
    } catch {
      setError('Fehler beim Erstellen des Tickets. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout user={user || { email: '', role: 'USER' }}>
      <div className="p-12 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neues Support-Ticket</h1>
          <p className="text-muted-foreground">
            Beschreiben Sie Ihr Anliegen so detailliert wie möglich
          </p>
        </div>

        <Card>
        <CardHeader>
          <CardTitle>Ticket-Informationen</CardTitle>
          <CardDescription>
            Füllen Sie alle Felder aus um ein Support-Ticket zu erstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-[9px]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Betreff *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Kurze Beschreibung des Problems"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'FEHLER' | 'VORSCHLAG' | 'HILFE')}
                className="w-full rounded-[9px] border border-[#d9dde1] bg-background px-3 py-2"
                required
              >
                <option value="HILFE">🤝 Hilfestellung</option>
                <option value="FEHLER">🐛 Fehler/Bug</option>
                <option value="VORSCHLAG">💡 Vorschlag/Feature</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht *</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                className="w-full min-h-[200px] rounded-[9px] border border-[#d9dde1] bg-background px-3 py-2"
                required
              />
            </div>

              <div className="space-y-2">
              <Label>Anhänge (optional)</Label>
              <div className="border-2 border-dashed border-[#d9dde1] rounded-[9px] p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={files.length >= 3}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${files.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klicken Sie hier um Bilder hochzuladen
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, JPEG, WebP (max. 3MB, max. 3 Dateien)
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-[#d9dde1] rounded-[9px]">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#22D6DD] hover:bg-[#22D6DD]/90">
                {isLoading ? 'Wird erstellt...' : 'Ticket erstellen'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}

