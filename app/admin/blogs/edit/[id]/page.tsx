"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getBlogPost, updateBlog } from "@/lib/blogActions"
import { ArrowLeft, Eye, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import BlogForm from "@/components/admin/BlogForm"

interface Blog {
  _id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
  isVisible: boolean
  tags: string[]
  scheduledPublishDate?: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  imageUrl: string
}

export default function EditBlog() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    content: blog?.content || "",
    author: blog?.author || "",
    isVisible: blog?.isVisible ?? true,
    tags: blog?.tags?.join(", ") || "",
    scheduledPublishDate: blog?.scheduledPublishDate || "",
    seoTitle: blog?.seoTitle || "",
    seoDescription: blog?.seoDescription || "",
    seoKeywords: blog?.seoKeywords?.join(", ") || "",
    imageUrl: "",
  })

  useEffect(() => {
    const fetchBlog = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const blogData = await getBlogPost(params.id as string)
        // console.log(blogData)
        if (!blogData) {
          setError("Blog post not found")
          return
        }

        setBlog(blogData as Blog)
        // console.log(blogData as Blog) 
      } catch (err) {
        setError("Failed to load blog post")
        console.error(err)
      } finally {
        setLoading(false)
        // console.log(blog?._id)
      }
    }

    fetchBlog()
  }, [params.id])

  // Show success message and refresh blog data after update
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false)
        // Refresh the blog data to show updated information
        if (params.id) {
            // console.log(params.id)
          getBlogPost(params.id as string).then((updatedBlog) => {
            if (updatedBlog) {
              setBlog(updatedBlog as Blog)
            }
          })
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [updateSuccess, params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Blog</h1>
          <p className="text-gray-600 mb-6">{error || "Blog post not found"}</p>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {updateSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Blog updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/blogs"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blogs
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Blog Post</h1>
                <p className="text-sm text-gray-600">ID: {params.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  blog.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {blog.isVisible ? "Published" : "Draft"}
              </span>

              {/* Preview Button */}
              <Link
                href={`/blog/${blog._id}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Info Panel */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-2 text-lg">{blog.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Author:</span>
                  <span className="text-blue-800 ml-2">{blog.author}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Created:</span>
                  <span className="text-blue-800 ml-2">{formatDate(blog.createdAt)}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Last Updated:</span>
                  <span className="text-blue-800 ml-2">{formatDate(blog.updatedAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-3">
                  <span className="text-blue-700 font-medium text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blog Image Thumbnail */}
            {blog.imageUrl && (
              <div className="ml-4 flex-shrink-0">
                <img
                  src={blog.imageUrl || "/placeholder.svg"}
                  alt={blog.title}
                  className="w-24 h-24 object-cover rounded-lg border border-blue-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Edit Blog Content</h3>
              <p className="text-sm text-gray-600 mt-1">
                Make changes to your blog post. All changes will be saved when you submit the form.
              </p>
            </div>

            {/* Blog Form */}
            <div className="p-6">
              <BlogForm blog={blog} onSuccess={() => setUpdateSuccess(true)} />
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>Last saved: {formatDate(blog.updatedAt)}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/blogs")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}