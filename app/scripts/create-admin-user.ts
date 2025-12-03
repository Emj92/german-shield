import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  const email = 'kontakt@meindl-webdesign.de'
  const password = 'Erolfni1992ge-!'
  const name = 'Erwin Meindl'

  try {
    // Prüfen ob User bereits existiert
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      console.log('❌ User existiert bereits!')
      console.log('Lösche existierenden User...')
      await prisma.user.delete({ where: { email } })
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10)

    // Admin-User erstellen
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true, // Admin ist sofort verifiziert
      },
    })

    console.log('✅ Admin-User erfolgreich erstellt!')
    console.log('📧 E-Mail:', email)
    console.log('👤 Name:', name)
    console.log('🔑 Rolle:', user.role)
    console.log('🆔 ID:', user.id)
    console.log('\n🔐 Du kannst dich jetzt einloggen!')
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()

