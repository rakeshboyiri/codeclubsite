import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export async function isAdmin() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')

  if (!token) {
    return false
  }

  try {
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
    
    if (!payload.sub) {
      return false
    }

    const client = await clientPromise
    const db = client.db('codeclub')
    // const user = await db.collection('users').findOne({ _id: payload.sub })
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.sub) })

    return user?.role === 'admin'
  } catch (error) {
    console.error('Error verifying admin status:', error)
    return false
  }
}

