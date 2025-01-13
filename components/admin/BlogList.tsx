'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Blog, PaginatedBlogs } from '@/types/blog'
import { deleteBlog, toggleBlogVisibility, getBlogPosts, getBlogTags } from '@/lib/blogActions'

interface BlogListProps {
  initialBlogData: PaginatedBlogs
}

export default function BlogList({ initialBlogData }: BlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogData.blogs)
  const [currentPage, setCurrentPage] = useState(initialBlogData.currentPage)
  const [totalPages, setTotalPages] = useState(initialBlogData.totalPages)
  const [selectedTag, setSelectedTag] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = await getBlogTags()
      setTags(fetchedTags)
    }
    fetchTags()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(id)
      setBlogs(blogs.filter(blog => blog._id !== id))
    }
  }

  const handleToggleVisibility = async (id: string) => {
    const updatedBlog = await toggleBlogVisibility(id)
    setBlogs(blogs.map(blog => blog._id === id ? updatedBlog : blog))
  }

  const handlePageChange = async (newPage: number) => {
    const result = await getBlogPosts(newPage, selectedTag)
    setBlogs(result.blogs)
    setCurrentPage(result.currentPage)
    setTotalPages(result.totalPages)
  }

  const handleTagChange = async (tag: string) => {
    setSelectedTag(tag)
    const result = await getBlogPosts(1, tag)
    setBlogs(result.blogs)
    setCurrentPage(result.currentPage)
    setTotalPages(result.totalPages)
  }

  return (
    <div>
      <div className="mb-4">
        <select 
          value={selectedTag} 
          onChange={(e) => handleTagChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td className="px-6 py-4 whitespace-nowrap">{blog.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{blog.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {blog.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/blogs/edit/${blog._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <button onClick={() => handleToggleVisibility(blog._id)} className="text-yellow-600 hover:text-yellow-900 mr-4">
                    {blog.isVisible ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
        >
          Previous
        </button>
        <span className="py-2 px-4">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
        >
          Next
        </button>
      </div>
    </div>
  )
}

