import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // Lösche Session aus DB
      await prisma.session.deleteMany({
        where: { token },
      })
    }

    // Lösche Cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

