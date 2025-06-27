// 'use server'

// import clientPromise from '@/lib/mongodb'
// import { ObjectId } from 'mongodb'
// import { Notice, PaginatedNotices, Comment } from '@/types/notice'
// //import { Server as SocketIOServer } from 'socket.io' // Removed
// import { revalidatePath } from 'next/cache'
// import { writeFile } from 'fs/promises'
// import path from 'path'

// const ITEMS_PER_PAGE = 10

// export default async function getNotices(page: number = 1, category?: string, searchTerm?: string): Promise<PaginatedNotices> {
//   const client = await clientPromise
//   const db = client.db('codeclub')
  
//   const query: any = {}
  
//   if (category) {
//     query.category = category
//   }

//   if (searchTerm) {
//     query.$or = [
//       { title: { $regex: searchTerm, $options: 'i' } },
//       { content: { $regex: searchTerm, $options: 'i' } },
//       { tags: { $in: [new RegExp(searchTerm, 'i')] } }
//     ]
//   }

//   const totalItems = await db.collection('notices').countDocuments(query)
//   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

//   const notices = await db.collection('notices')
//     .find(query)
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * ITEMS_PER_PAGE)
//     .limit(ITEMS_PER_PAGE)
//     .toArray()

//   return {
//     notices: notices.map(notice => ({
//       ...notice,
//       _id: notice._id.toString(),
//     })) as Notice[],
//     totalPages,
//     currentPage: page
//   }
// }

// export  async function getNotice(id: string): Promise<Notice | null> {
//   const client = await clientPromise
//   const db = client.db('codeclub')
//   const notice = await db.collection('notices').findOne({ _id: new ObjectId(id) })
//   if (notice) {
//     return { ...notice, _id: notice._id.toString() } as Notice
//   }
//   return null
// }

// export async function createNotice(formData: FormData): Promise<Notice> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const noticeData: Omit<Notice, '_id'> = {
//     title: formData.get('title') as string,
//     content: formData.get('content') as string,
//     category: formData.get('category') as string,
//     priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     author: 'Admin', // You might want to get this from the session
//     tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
//     attachments: [],
//     views: 0,
//     bookmarks: 0,
//     isVisible: true,
//   }

//   const attachments = formData.getAll('attachments') as File[]
//   for (const attachment of attachments) {
//     const buffer = Buffer.from(await attachment.arrayBuffer())
//     const filename = attachment.name
//     const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
//     await writeFile(filepath, buffer)

//     noticeData.attachments.push({
//       type: attachment.type.startsWith('image/') ? 'image' : 
//             attachment.type === 'application/pdf' ? 'pdf' : 'document',
//       url: `/uploads/${filename}`,
//       filename: filename,
//     })
//   }

//   const result = await db.collection('notices').insertOne(noticeData)
//   const createdNotice = { ...noticeData, _id: result.insertedId.toString() }

//   // Removed Socket.IO emit block
//   revalidatePath('/notices')
//   return createdNotice
// }

// export async function updateNotice(id: string, formData: FormData): Promise<Notice> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const noticeData = {
//     title: formData.get('title') as string,
//     content: formData.get('content') as string,
//     category: formData.get('category') as string,
//     priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
//     updatedAt: new Date(),
//     scheduledFor: formData.get('scheduledFor') as string || undefined,
//     expiresAt: formData.get('expiresAt') as string || undefined,
//     tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
//     isVisible: formData.get('isVisible') === 'true', // Added isVisible field
//   }

//   await db.collection('notices').updateOne(
//     { _id: new ObjectId(id) },
//     { $set: noticeData }
//   )

//   const updatedNotice = await getNotice(id)
  
//   if (!updatedNotice) {
//     throw new Error('Failed to update notice')
//   }

//   // Removed Socket.IO emit block
//   revalidatePath(`/notices/${id}`)
//   revalidatePath('/notices')
//   return updatedNotice
// }

// export async function deleteNotice(id: string): Promise<void> {
//   const client = await clientPromise
//   const db = client.db('codeclub')
//   await db.collection('notices').deleteOne({ _id: new ObjectId(id) })

//   // Removed Socket.IO emit block
//   revalidatePath('/notices')
// }

// export async function addComment(noticeId: string, userId: string, content: string): Promise<Comment> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const comment: Omit<Comment, '_id'> = {
//     noticeId,
//     userId,
//     content,
//     createdAt: new Date().toISOString(),
//   }

//   const result = await db.collection('comments').insertOne(comment)
//   const createdComment: Comment = { ...comment, _id: result.insertedId.toString() }

//   // Removed Socket.IO emit block
//   revalidatePath(`/notices/${noticeId}`)
//   return createdComment
// }

// export async function getComments(noticeId: string): Promise<Comment[]> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const comments = await db.collection('comments')
//     .find({ noticeId })
//     .sort({ createdAt: -1 })
//     .toArray()

//   return comments.map(comment => ({
//     ...comment,
//     _id: comment._id.toString(),
//     createdAt: comment.createdAt.toISOString(),
//   })) as Comment[]
// }

// export async function bookmarkNotice(noticeId: string, userId: string): Promise<void> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   await db.collection('bookmarks').updateOne(
//     { userId, noticeId },
//     { $setOnInsert: { createdAt: new Date() } },
//     { upsert: true }
//   )

//   await db.collection('notices').updateOne(
//     { _id: new ObjectId(noticeId) },
//     { $inc: { bookmarks: 1 } }
//   )

//   revalidatePath(`/notices/${noticeId}`)
// }

// export async function unbookmarkNotice(noticeId: string, userId: string): Promise<void> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   await db.collection('bookmarks').deleteOne({ userId, noticeId })

//   await db.collection('notices').updateOne(
//     { _id: new ObjectId(noticeId) },
//     { $inc: { bookmarks: -1 } }
//   )

//   revalidatePath(`/notices/${noticeId}`)
// }

// export async function getBookmarkedNotices(userId: string): Promise<Notice[]> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const bookmarks = await db.collection('bookmarks')
//     .find({ userId })
//     .toArray()

//   const noticeIds = bookmarks.map(bookmark => new ObjectId(bookmark.noticeId))

//   const notices = await db.collection('notices')
//     .find({ _id: { $in: noticeIds } })
//     .toArray()

//   return notices.map(notice => ({
//     ...notice,
//     _id: notice._id.toString(),
//   })) as Notice[]
// }

// export async function incrementNoticeViews(noticeId: string): Promise<void> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   await db.collection('notices').updateOne(
//     { _id: new ObjectId(noticeId) },
//     { $inc: { views: 1 } }
//   )

//   revalidatePath(`/notices/${noticeId}`)
// }

// export async function getNoticeTags(): Promise<string[]> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const tags = await db.collection('notices').distinct('tags')
//   return tags
// }

// export async function toggleNoticeVisibility(id: string): Promise<Notice> {
//   const client = await clientPromise
//   const db = client.db('codeclub')

//   const notice = await db.collection('notices').findOne({ _id: new ObjectId(id) })
//   if (!notice) {
//     throw new Error('Notice not found')
//   }

//   const newVisibility = !notice.isVisible
//   await db.collection('notices').updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { isVisible: newVisibility } }
//   )

//   const updatedNotice = { ...notice, _id: id, isVisible: newVisibility }

//   // Removed Socket.IO emit block
//   revalidatePath('/admin/notices')
//   revalidatePath('/notices')
//   return updatedNotice as Notice
// }



'use client'

import { useState, useEffect } from 'react'
import { Notice, Comment } from '@/types/notice'
import { getNotice, addComment, getComments, bookmarkNotice, unbookmarkNotice } from '@/lib/noticeActions'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookmarkIcon, AlertCircle, Send } from 'lucide-react'

interface NoticeDetailProps {
  noticeId: string
}

export default function NoticeDetail({ noticeId }: NoticeDetailProps) {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchNotice()
    fetchComments()

    const interval = setInterval(() => {
      fetchNotice()
      fetchComments()
    }, 30000)

    return () => clearInterval(interval)
  }, [noticeId])

  const fetchNotice = async () => {
    try {
      const fetchedNotice = await getNotice(noticeId)
      setNotice(fetchedNotice)
      setIsBookmarked((fetchedNotice?.bookmarks ?? 0) > 0)
    } catch (err) {
      setError('Failed to fetch notice. Please try again later.')
      console.error('Error fetching notice:', err)
    }
  }

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(noticeId)
      setComments(fetchedComments)
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      setError('You must be logged in to comment.')
      return
    }
    try {
      await addComment(noticeId, session.user.id, newComment)
      setNewComment('')
      fetchComments()
    } catch (err) {
      setError('Failed to add comment. Please try again.')
      console.error('Error adding comment:', err)
    }
  }

  const handleBookmark = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to bookmark notices.')
      return
    }
    try {
      if (isBookmarked) {
        await unbookmarkNotice(noticeId, session.user.id)
      } else {
        await bookmarkNotice(noticeId, session.user.id)
      }
      setIsBookmarked(!isBookmarked)
      fetchNotice()
    } catch (err) {
      setError('Failed to update bookmark. Please try again.')
      console.error('Error updating bookmark:', err)
    }
  }

  if (!notice) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{notice.title}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBookmark}
              aria-label={isBookmarked ? "Unbookmark" : "Bookmark"}
            >
              <BookmarkIcon className={isBookmarked ? "fill-current" : ""} />
            </Button>
          </CardTitle>
          <div className="flex gap-2">
            <Badge>{notice.category}</Badge>
            <Badge variant="outline">{notice.priority}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{notice.content}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {notice.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
          {notice.attachments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Attachments:</h3>
              <ul className="list-disc list-inside">
                {notice.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {attachment.type} attachment
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-sm text-gray-500">
            <p>Posted by: {notice.author}</p>
            <p>Created: {new Date(notice.createdAt).toLocaleString()}</p>
            <p>Last updated: {new Date(notice.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.map((comment) => (
            <div key={comment._id} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p>{comment.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted on: {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleAddComment} className="w-full">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full mb-2"
            />
            <Button type="submit" disabled={!session?.user?.id}>
              <Send className="mr-2 h-4 w-4" /> Add Comment
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

