import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    // User mit Token finden
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date() // Token noch gültig
        }
      },
      select: {
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({
      valid: true,
      email: user.email
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ valid: false })
  }
}

