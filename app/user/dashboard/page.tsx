import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import LogoutButton from '../../../components/LogoutButton'

async function getUserInfo() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
    
    if (payload.role !== 'user') {
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

export default async function UserDashboard() {
  const userInfo = await getUserInfo()

  if (!userInfo) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {userInfo.email}</h2>
        <p className="text-gray-600 mb-4">
          Here you can access your personal information, view your progress, and manage your account.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">My Courses</h3>
            <p>View and manage your enrolled courses</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resources</h3>
            <p>Access learning materials and resources</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Progress</h3>
            <p>Track your learning progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}

