import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import AdminLicensesContent from './content'
import { DashboardLayout } from '@/components/DashboardLayout'

export default async function AdminLicensesPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={user}>
      <AdminLicensesContent />
    </DashboardLayout>
  )
}
