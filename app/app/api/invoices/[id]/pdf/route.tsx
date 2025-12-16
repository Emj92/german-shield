import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf-generator'
import crypto from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.userId
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // GoBD: Generiere PDF mit React-PDF
    const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoice} />)
    
    // GoBD: Berechne SHA-256 Hash des PDFs
    const pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex')
    
    // GoBD: Speichere Hash in Datenbank (nur beim ersten Mal)
    if (!invoice.pdfHash) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfHash }
      })
      
      // Audit-Log
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: invoice.id,
          action: 'PDF_HASH_GENERATED',
          changes: { pdfHash },
          performedBy: user.userId,
          timestamp: new Date()
        }
      })
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Rechnung-${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'public, max-age=31536000, immutable', // GoBD: Unveränderbar
      }
    })

  } catch (error) {
    console.error('PDF generation failed:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
