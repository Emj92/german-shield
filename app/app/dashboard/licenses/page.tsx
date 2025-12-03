import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import UserLicensesContent from './content'

export default async function UserLicensesPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return <UserLicensesContent />
}
