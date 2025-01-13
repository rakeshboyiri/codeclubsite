'use client'

import { useState, useEffect } from 'react'
import { Notice, PaginatedNotices } from '@/types/notice'
import { getNotices, getNoticeTags } from '@/lib/noticeActions'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotices()
    fetchTags()

    const socket: Socket = io()
    socket.on('noticeCreated', handleNoticeUpdate)
    socket.on('noticeUpdated', handleNoticeUpdate)
    socket.on('noticeDeleted', handleNoticeUpdate)

    return () => {
      socket.off('noticeCreated', handleNoticeUpdate)
      socket.off('noticeUpdated', handleNoticeUpdate)
      socket.off('noticeDeleted', handleNoticeUpdate)
      socket.disconnect()
    }
  }, [currentPage, category, searchTerm])

  const fetchNotices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result: PaginatedNotices = await getNotices(currentPage, category, searchTerm)
      setNotices(result.notices)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError('Failed to fetch notices. Please try again later.')
      console.error('Error fetching notices:', err)
    }
    setIsLoading(false)
  }

  const fetchTags = async () => {
    try {
      const fetchedTags = await getNoticeTags()
      setTags(fetchedTags)
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const handleNoticeUpdate = () => {
    fetchNotices()
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchNotices()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notice Board</h1>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Select onValueChange={handleCategoryChange} value={category}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notices..."
            className="mr-2"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <CardHeader>
                <CardTitle>{notice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{notice.content.substring(0, 100)}...</p>
                <div className="flex flex-wrap gap-2">
                  {notice.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                <Link href={`/notices/${notice._id}`}>
                  <Button variant="outline">Read More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          variant="outline"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

