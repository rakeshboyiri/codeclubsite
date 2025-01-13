import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import LogoutButton from '../../../components/LogoutButton'

async function getAdminInfo() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
    
    if (payload.role !== 'admin') {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email as string,
      role: payload.role as string
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export default async function AdminDashboard() {
  const adminInfo = await getAdminInfo()

  if (!adminInfo) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin {adminInfo.email}</h2>
        <p className="text-gray-600 mb-4">
          You have access to all administrative functions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">User Management</h3>
            <p>Manage user accounts and permissions</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Content Management</h3>
            <p>Manage blogs, notices, and resources</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p>View site statistics and user engagement</p>
          </div>
        </div>
      </div>
    </div>
  )
}

