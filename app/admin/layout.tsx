import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '../../lib/auth'
import LogoutButton from '../../components/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminCheck = await isAdmin()

  if (!adminCheck) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <ul className="space-y-2">
            <li><Link href="/admin/dashboard" className="block hover:text-blue-300">Dashboard</Link></li>
            <li><Link href="/admin/blogs" className="block hover:text-blue-300">Manage Blogs</Link></li>
            <li><Link href="/admin/notices" className="block hover:text-blue-300">Manage Notices</Link></li>
            <li><Link href="/admin/exams" className="block hover:text-blue-300">Manage Exams</Link></li>
            <li><Link href="/admin/resources" className="block hover:text-blue-300">Manage Resources</Link></li>
            <li><Link href="/admin/events" className="block hover:text-blue-300">Manage Events</Link></li>
            <li><Link href="/admin/users" className="block hover:text-blue-300">Manage Users</Link></li>
          </ul>
        </nav>
        <div className="mt-auto pt-6">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

