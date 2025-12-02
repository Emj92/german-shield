import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'support@germanfence.de'
  const password = 'Erolfni1992'
  const name = 'Admin'

  console.log('🔧 Erstelle Admin-User...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('⚠️  Admin-User existiert bereits!')
    return
  }

  // Create admin
  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin-User erfolgreich erstellt!')
  console.log('')
  console.log('📧 E-Mail:', email)
  console.log('🔑 Passwort:', password)
  console.log('')
  console.log('⚠️  Bitte ändere das Passwort nach dem ersten Login!')
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

