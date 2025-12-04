import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import SettingsContent from './content'
import { DashboardLayout } from '@/components/DashboardLayout'

export default async function SettingsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={user}>
      <SettingsContent user={user} />
    </DashboardLayout>
  )
}
