import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import AdminUsersContent from './content'

export default async function AdminUsersPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminUsersContent />
}
