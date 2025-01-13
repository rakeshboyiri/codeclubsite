'use server'

import { hash } from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'user' | 'admin'

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required' }
  }

  try {
    const client = await clientPromise
    const db = client.db('codeclub')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return { error: 'User already exists' }
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Insert the new user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    })

    return { success: true, message: 'User registered successfully' }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'An error occurred during registration' }
  }
}

