import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to CodeClub</h1>
      <p className="text-xl mb-8">Enhance your learning and productivity with our resources and tools.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Latest Blogs</h2>
          <ul className="space-y-2">
            <li><Link href="/blogs/1" className="text-blue-600 hover:underline">Introduction to React Hooks</Link></li>
            <li><Link href="/blogs/2" className="text-blue-600 hover:underline">Mastering CSS Grid Layout</Link></li>
            <li><Link href="/blogs/3" className="text-blue-600 hover:underline">Python for Data Science: Getting Started</Link></li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Notices</h2>
          <ul className="space-y-2">
            <li><Link href="/notices/1" className="text-blue-600 hover:underline">Upcoming Coding Competition</Link></li>
            <li><Link href="/notices/2" className="text-blue-600 hover:underline">New Resources Added for Machine Learning</Link></li>
            <li><Link href="/notices/3" className="text-blue-600 hover:underline">Changes to the Club Meeting Schedule</Link></li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Featured Resources</h2>
          <ul className="space-y-2">
            <li><Link href="/resources/1" className="text-blue-600 hover:underline">JavaScript: The Good Parts (eBook)</Link></li>
            <li><Link href="/resources/2" className="text-blue-600 hover:underline">Introduction to Algorithms (Video Series)</Link></li>
            <li><Link href="/resources/3" className="text-blue-600 hover:underline">Git & GitHub Cheat Sheet (PDF)</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

