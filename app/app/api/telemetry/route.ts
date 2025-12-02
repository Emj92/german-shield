import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Telemetry Endpoint
 * Empfängt anonymisierte Spam-Block-Events von Plugin-Installationen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validiere Pflichtfelder
    if (!body.ip_hash || !body.block_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Speichere Event
    const event = await prisma.telemetryEvent.create({
      data: {
        ipHash: body.ip_hash,
        countryCode: body.country_code || null,
        blockMethod: body.block_method,
        blockReason: body.block_reason || null,
        emailDomainHash: body.email_domain_hash || null,
        spamDomains: body.spam_domains || null,
        userAgentHash: body.user_agent_hash || null,
      },
    })
    
    console.log('[Telemetry] Event empfangen:', {
      id: event.id,
      method: event.blockMethod,
      country: event.countryCode,
    })
    
    return NextResponse.json({ success: true, id: event.id })
    
  } catch (error) {
    console.error('[Telemetry] Fehler:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

