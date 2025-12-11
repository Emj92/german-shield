import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// CORS-Header für Cross-Origin-Anfragen vom Plugin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Version',
}

/**
 * Telemetry Endpoint
 * Empfängt anonymisierte Spam-Block-Events von Plugin-Installationen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[Telemetry] Eingehende Daten:', JSON.stringify(body, null, 2))
    
    // Validiere Pflichtfelder
    if (!body.ip_hash || !body.block_method) {
      console.log('[Telemetry] Fehler: Pflichtfelder fehlen', { ip_hash: body.ip_hash, block_method: body.block_method })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
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
    
    console.log('[Telemetry] ✅ Event gespeichert:', {
      id: event.id,
      method: event.blockMethod,
      country: event.countryCode,
    })
    
    return NextResponse.json({ success: true, id: event.id }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('[Telemetry] ❌ Fehler:', error)
    return NextResponse.json({ success: false }, { status: 500, headers: corsHeaders })
  }
}

// OPTIONS für CORS Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: corsHeaders }
  )
}

