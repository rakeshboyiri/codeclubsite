import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise
  const db = client.db('codeclub')

  const image = await db.collection('images').findOne({ _id: new ObjectId(params.id) })

  if (!image) {
    return new NextResponse('Image not found', { status: 404 })
  }

  const response = new NextResponse(image.data.buffer)
  response.headers.set('Content-Type', image.contentType)
  return response
}

