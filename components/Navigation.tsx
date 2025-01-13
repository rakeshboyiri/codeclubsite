'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">CodeClub</Link>
        <div className="space-x-4">
          <Link href="/blogs" className={`hover:text-blue-200 ${isActive('/blogs') ? 'underline' : ''}`}>Blogs</Link>
          <Link href="/notices" className={`hover:text-blue-200 ${isActive('/notices') ? 'underline' : ''}`}>Notices</Link>
          <Link href="/exams" className={`hover:text-blue-200 ${isActive('/exams') ? 'underline' : ''}`}>Exam Papers</Link>
          <Link href="/resources" className={`hover:text-blue-200 ${isActive('/resources') ? 'underline' : ''}`}>Resources</Link>
          <Link href="/events" className={`hover:text-blue-200 ${isActive('/events') ? 'underline' : ''}`}>Events</Link>
          <Link href="/profile" className={`hover:text-blue-200 ${isActive('/profile') ? 'underline' : ''}`}>Profile</Link>
          <Link href="/login" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400">Login</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

