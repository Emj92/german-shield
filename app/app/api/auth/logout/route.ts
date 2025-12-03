import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value

    if (token) {
      // Lösche Session aus DB
      await prisma.session.deleteMany({
        where: { token },
      })
    }

    // Redirect zum Login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}

