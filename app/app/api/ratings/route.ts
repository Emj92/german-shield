import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// CORS-Headers für Cross-Origin-Anfragen von der Website
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// GET - Bewertungs-Statistiken und letzte Bewertungen abrufen
export async function GET() {
  try {
    // Durchschnittliche Bewertung
    const avgResult = await prisma.rating.aggregate({
      _avg: { stars: true },
      _count: { stars: true },
      where: { approved: true },
    })

    // Verteilung der Sterne
    const distribution = await prisma.rating.groupBy({
      by: ['stars'],
      _count: { stars: true },
      where: { approved: true },
    })

    // Letzte 5 Bewertungen mit Kommentar
    const recentRatings = await prisma.rating.findMany({
      where: { 
        approved: true,
        comment: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        stars: true,
        comment: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      average: Math.round((avgResult._avg.stars || 0) * 10) / 10,
      total: avgResult._count.stars,
      distribution: distribution.reduce((acc, d) => {
        acc[d.stars] = d._count.stars
        return acc
      }, {} as Record<number, number>),
      recentRatings,
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// POST - Neue Bewertung abgeben
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stars, comment, name } = body

    // Validierung
    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Stars must be between 1 and 5' },
        { status: 400, headers: corsHeaders }
      )
    }

    // IP-Hash für Spam-Schutz
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + 'germanfence-rating-salt').digest('hex')

    // Prüfe ob diese IP in den letzten 24h schon bewertet hat
    const recentRating = await prisma.rating.findFirst({
      where: {
        ipHash,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    if (recentRating) {
      return NextResponse.json(
        { error: 'Du hast bereits in den letzten 24 Stunden bewertet' },
        { status: 429, headers: corsHeaders }
      )
    }

    // Neue Bewertung erstellen
    const rating = await prisma.rating.create({
      data: {
        stars,
        comment: comment?.trim() || null,
        name: name?.trim() || null,
        ipHash,
        approved: true, // Auto-approve (kann später moderiert werden)
      },
    })

    // Aktualisierte Stats zurückgeben
    const avgResult = await prisma.rating.aggregate({
      _avg: { stars: true },
      _count: { stars: true },
      where: { approved: true },
    })

    return NextResponse.json({
      success: true,
      rating: {
        id: rating.id,
        stars: rating.stars,
      },
      newAverage: Math.round((avgResult._avg.stars || 0) * 10) / 10,
      newTotal: avgResult._count.stars,
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error creating rating:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// OPTIONS für CORS Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

