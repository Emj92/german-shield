import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        licenses: {
          include: {
            activeDomains: {
              select: {
                domain: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        supportTickets: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

