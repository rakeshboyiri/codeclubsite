'use client'

import { useState, useEffect } from 'react'
import { Notice, Comment } from '@/types/notice'
import { getNotice, addComment, getComments, bookmarkNotice, unbookmarkNotice } from '@/lib/noticeActions'
import { useSession } from 'next-auth/react'
import io from 'socket.io-client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookmarkIcon, AlertCircle, Send } from 'lucide-react'

import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"

interface NoticeDetailProps {
  noticeId: string
}

export default function NoticeDetail({ noticeId }: NoticeDetailProps) {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const [session, loading] = useSession()

  useEffect(() => {
    fetchNotice()
    fetchComments()

    const socket = io()
    socket.emit('joinNotice', noticeId)

    socket.on('noticeUpdated', fetchNotice)
    socket.on('commentAdded', fetchComments)

    return () => {
      socket.emit('leaveNotice', noticeId)
      socket.off('noticeUpdated', fetchNotice)
      socket.off('commentAdded', fetchComments)
      socket.disconnect()
    }
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

