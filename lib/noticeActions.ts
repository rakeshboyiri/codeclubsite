'use server'

import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Notice, PaginatedNotices, Comment } from '@/types/notice'
import { Server as SocketIOServer } from 'socket.io'
import { revalidatePath } from 'next/cache'
import { writeFile } from 'fs/promises'
import path from 'path'

const ITEMS_PER_PAGE = 10

export async function getNotices(page: number = 1, category?: string, searchTerm?: string): Promise<PaginatedNotices> {
  const client = await clientPromise
  const db = client.db('codeclub')
  
  const query: any = {}
  
  if (category) {
    query.category = category
  }

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }

  const totalItems = await db.collection('notices').countDocuments(query)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const notices = await db.collection('notices')
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray()

  return {
    notices: notices.map(notice => ({
      ...notice,
      _id: notice._id.toString(),
    })) as Notice[],
    totalPages,
    currentPage: page
  }
}

export async function getNotice(id: string): Promise<Notice | null> {
  const client = await clientPromise
  const db = client.db('codeclub')
  const notice = await db.collection('notices').findOne({ _id: new ObjectId(id) })
  if (notice) {
    return { ...notice, _id: notice._id.toString() } as Notice
  }
  return null
}

export async function createNotice(formData: FormData): Promise<Notice> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const noticeData: Omit<Notice, '_id'> = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Admin', // You might want to get this from the session
    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
    attachments: [],
    views: 0,
    bookmarks: 0,
    isVisible: true,
  }

  const attachments = formData.getAll('attachments') as File[]
  for (const attachment of attachments) {
    const buffer = Buffer.from(await attachment.arrayBuffer())
    const filename = attachment.name
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(filepath, buffer)

    noticeData.attachments.push({
      type: attachment.type.startsWith('image/') ? 'image' : 
            attachment.type === 'application/pdf' ? 'pdf' : 'document',
      url: `/uploads/${filename}`,
      filename: filename,
    })
  }

  const result = await db.collection('notices').insertOne(noticeData)
  const createdNotice = { ...noticeData, _id: result.insertedId.toString() }

  // Emit WebSocket event if the io object is available
  try {
    const io = (global as any).io as SocketIOServer
    if (io && typeof io.emit === 'function') {
      io.emit('noticeCreated', createdNotice)
    }
  } catch (error) {
    console.error('Failed to emit WebSocket event:', error)
  }

  revalidatePath('/notices')
  return createdNotice
}

export async function updateNotice(id: string, formData: FormData): Promise<Notice> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const noticeData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
    updatedAt: new Date(),
    scheduledFor: formData.get('scheduledFor') as string || undefined,
    expiresAt: formData.get('expiresAt') as string || undefined,
    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
    isVisible: formData.get('isVisible') === 'true', // Added isVisible field
  }

  await db.collection('notices').updateOne(
    { _id: new ObjectId(id) },
    { $set: noticeData }
  )

  const updatedNotice = await getNotice(id)
  
  if (!updatedNotice) {
    throw new Error('Failed to update notice')
  }

  // Emit WebSocket event
  const io = (global as any).io as SocketIOServer
  io.to(id).emit('noticeUpdated', updatedNotice)
  io.emit('noticeUpdated')

  revalidatePath(`/notices/${id}`)
  revalidatePath('/notices')
  return updatedNotice
}

export async function deleteNotice(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('codeclub')
  await db.collection('notices').deleteOne({ _id: new ObjectId(id) })

  // Emit WebSocket event
  const io = (global as any).io as SocketIOServer
  io.emit('noticeDeleted', id)

  revalidatePath('/notices')
}

export async function addComment(noticeId: string, userId: string, content: string): Promise<Comment> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const comment: Omit<Comment, '_id'> = {
    noticeId,
    userId,
    content,
    createdAt: new Date().toISOString(),
  }

  const result = await db.collection('comments').insertOne(comment)
  const createdComment: Comment = { ...comment, _id: result.insertedId.toString() }

  // Emit WebSocket event
  const io = (global as any).io as SocketIOServer
  io.to(noticeId).emit('commentAdded', createdComment)

  revalidatePath(`/notices/${noticeId}`)
  return createdComment
}

export async function getComments(noticeId: string): Promise<Comment[]> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const comments = await db.collection('comments')
    .find({ noticeId })
    .sort({ createdAt: -1 })
    .toArray()

  return comments.map(comment => ({
    ...comment,
    _id: comment._id.toString(),
    createdAt: comment.createdAt.toISOString(),
  })) as Comment[]
}

export async function bookmarkNotice(noticeId: string, userId: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('codeclub')

  await db.collection('bookmarks').updateOne(
    { userId, noticeId },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  )

  await db.collection('notices').updateOne(
    { _id: new ObjectId(noticeId) },
    { $inc: { bookmarks: 1 } }
  )

  revalidatePath(`/notices/${noticeId}`)
}

export async function unbookmarkNotice(noticeId: string, userId: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('codeclub')

  await db.collection('bookmarks').deleteOne({ userId, noticeId })

  await db.collection('notices').updateOne(
    { _id: new ObjectId(noticeId) },
    { $inc: { bookmarks: -1 } }
  )

  revalidatePath(`/notices/${noticeId}`)
}

export async function getBookmarkedNotices(userId: string): Promise<Notice[]> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const bookmarks = await db.collection('bookmarks')
    .find({ userId })
    .toArray()

  const noticeIds = bookmarks.map(bookmark => new ObjectId(bookmark.noticeId))

  const notices = await db.collection('notices')
    .find({ _id: { $in: noticeIds } })
    .toArray()

  return notices.map(notice => ({
    ...notice,
    _id: notice._id.toString(),
  })) as Notice[]
}

export async function incrementNoticeViews(noticeId: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('codeclub')

  await db.collection('notices').updateOne(
    { _id: new ObjectId(noticeId) },
    { $inc: { views: 1 } }
  )

  revalidatePath(`/notices/${noticeId}`)
}

export async function getNoticeTags(): Promise<string[]> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const tags = await db.collection('notices').distinct('tags')
  return tags
}

export async function toggleNoticeVisibility(id: string): Promise<Notice> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const notice = await db.collection('notices').findOne({ _id: new ObjectId(id) })
  if (!notice) {
    throw new Error('Notice not found')
  }

  const newVisibility = !notice.isVisible
  await db.collection('notices').updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVisible: newVisibility } }
  )

  const updatedNotice = { ...notice, _id: id, isVisible: newVisibility }

  // Emit WebSocket event
  const io = (global as any).io as SocketIOServer
  io.emit('noticeUpdated', updatedNotice)

  revalidatePath('/admin/notices')
  revalidatePath('/notices')
  return updatedNotice as Notice
}


