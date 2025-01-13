'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Blog } from '../../types/blog'
import { createBlog, updateBlog } from '../../lib/blogActions'

interface BlogFormProps {
  blog?: Blog
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    author: blog?.author || '',
    image: null as File | null,
    isVisible: blog?.isVisible ?? true,
    tags: blog?.tags?.join(', ') || '',
    scheduledPublishDate: blog?.scheduledPublishDate || '',
    seoTitle: blog?.seoTitle || '',
    seoDescription: blog?.seoDescription || '',
    seoKeywords: blog?.seoKeywords?.join(', ') || '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const formDataToSend = new FormData()
    //   Object.entries(formData).forEach(([key, value]) => {
    //     if (value !== null) {
    //       formDataToSend.append(key, value)
    //     }
    //   })

    Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (typeof value === 'string' || value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            // Handle the case where value is a boolean
            // You might want to convert it to a string or ignore it
            formDataToSend.append(key, String(value));
          }
        }
      })

      if (blog) {
        await updateBlog(blog._id, formDataToSend)
      } else {
        await createBlog(formDataToSend)
      }

      router.push('/admin/blogs')
    } catch (err) {
      setError('An error occurred while saving the blog.')
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author</label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="isVisible" className="block text-sm font-medium text-gray-700">Visibility</label>
        <select
  id="isVisible"
  name="isVisible"
  value={formData.isVisible.toString()}
  onChange={handleSelectChange}
  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
>
  <option value="true">Visible</option>
  <option value="false">Hidden</option>
</select>
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="scheduledPublishDate" className="block text-sm font-medium text-gray-700">Scheduled Publish Date</label>
        <input
          type="datetime-local"
          id="scheduledPublishDate"
          name="scheduledPublishDate"
          value={formData.scheduledPublishDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">SEO Title</label>
        <input
          type="text"
          id="seoTitle"
          name="seoTitle"
          value={formData.seoTitle}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">SEO Description</label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          value={formData.seoDescription}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>
      <div>
        <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">SEO Keywords (comma-separated)</label>
        <input
          type="text"
          id="seoKeywords"
          name="seoKeywords"
          value={formData.seoKeywords}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        {blog ? 'Update Blog' : 'Create Blog'}
      </button>
    </form>
  )
}

