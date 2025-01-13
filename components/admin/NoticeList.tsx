'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Notice, PaginatedNotices } from '@/types/notice'
import { deleteNotice, toggleNoticeVisibility, getNotices, getNoticeTags } from '@/lib/noticeActions'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip } from 'lucide-react'

interface NoticeListProps {
  initialNoticeData: PaginatedNotices
}

export default function NoticeList({ initialNoticeData }: NoticeListProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNoticeData.notices)
  const [currentPage, setCurrentPage] = useState(initialNoticeData.currentPage)
  const [totalPages, setTotalPages] = useState(initialNoticeData.totalPages)
  const [selectedTag, setSelectedTag] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = await getNoticeTags()
      setTags(fetchedTags)
    }
    fetchTags()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await deleteNotice(id)
      setNotices(notices.filter(notice => notice._id !== id))
    }
  }

  const handleToggleVisibility = async (id: string) => {
    const updatedNotice = await toggleNoticeVisibility(id)
    setNotices(notices.map(notice => notice._id === id ? updatedNotice : notice))
  }

  const handlePageChange = async (newPage: number) => {
    const result = await getNotices(newPage, selectedTag)
    setNotices(result.notices)
    setCurrentPage(result.currentPage)
    setTotalPages(result.totalPages)
  }

  const handleTagChange = async (tag: string) => {
    setSelectedTag(tag)
    const result = await getNotices(1, tag)
    setNotices(result.notices)
    setCurrentPage(result.currentPage)
    setTotalPages(result.totalPages)
  }

  return (
    <div>
      <div className="mb-4">
        <Select onValueChange={handleTagChange} value={selectedTag}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notices.map((notice) => (
          <Card key={notice._id}>
            <CardHeader>
              <CardTitle>{notice.title}</CardTitle>
              <Badge variant={notice.isVisible ? "default" : "secondary"}>
                {notice.isVisible ? 'Visible' : 'Hidden'}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{notice.content.substring(0, 100)}...</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {notice.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
              {notice.attachments.length > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <Paperclip className="w-4 h-4 mr-1" />
                  {notice.attachments.length} attachment(s)
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
              <div>
                <Button variant="outline" size="sm" className="mr-2" asChild>
                  <Link href={`/admin/notices/edit/${notice._id}`}>Edit</Link>
                </Button>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleToggleVisibility(notice._id)}>
                  {notice.isVisible ? 'Hide' : 'Show'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(notice._id)}>
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className="py-2 px-4">Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

