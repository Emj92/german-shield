import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const subject = formData.get('subject') as string
    const category = formData.get('category') as string
    const message = formData.get('message') as string
    const files = formData.getAll('files') as File[]

    if (!subject || !category || !message) {
      return NextResponse.json(
        { error: 'Fehlende Felder' },
        { status: 400 }
      )
    }

    // Erstelle Ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.userId,
        subject,
        category: category as any,
        message,
        status: 'OPEN',
        priority: 'NORMAL',
      },
    })

    // Upload Dateien
    if (files.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets', ticket.id)
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      for (const file of files) {
        if (file.size > 3 * 1024 * 1024) continue // Max 3MB
        
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filepath = join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        
        // Speichere Attachment in DB
        await prisma.ticketAttachment.create({
          data: {
            ticketId: ticket.id,
            filename: file.name,
            fileUrl: `/uploads/tickets/${ticket.id}/${filename}`,
            fileSize: file.size,
            mimeType: file.type,
          },
        })
      }
    }

    return NextResponse.json({ success: true, ticketId: ticket.id })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            responses: true,
            attachments: true,
          },
        },
      },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
}

