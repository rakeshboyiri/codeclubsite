"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getBlogPost, updateBlog } from "@/lib/blogActions"
import { ArrowLeft, Eye, Loader2, CheckCircle, Upload, X, Save } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    isVisible: true,
    tags: "",
    scheduledPublishDate: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  })

  useEffect(() => {
    const fetchBlog = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const blogData = await getBlogPost(params.id as string)

        if (!blogData) {
          setError("Blog post not found")
          return
        }

        setBlog(blogData as Blog)

        // Set form data with blog data
        setFormData({
          title: blogData.title || "",
          content: blogData.content || "",
          author: blogData.author || "",
          isVisible: blogData.isVisible ?? true,
          tags: blogData.tags?.join(", ") || "",
          scheduledPublishDate: blogData.scheduledPublishDate || "",
          seoTitle: blogData.seoTitle || "",
          seoDescription: blogData.seoDescription || "",
          seoKeywords: blogData.seoKeywords?.join(", ") || "",
        })
      } catch (err) {
        setError("Failed to load blog post")
        console.error(err)
      } finally {
        setLoading(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "isVisible") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError("")

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setImageError("Please select a valid image file (JPG, PNG, GIF, WebP)")
        setSelectedImage(null)
        setImagePreview(null)
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setImageError("Image size should be less than 10MB")
        setSelectedImage(null)
        setImagePreview(null)
        return
      }

      setSelectedImage(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      console.log("Selected image:", {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
      })
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError("")
    // Reset the file input
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add image only if a valid image is selected
      if (selectedImage && !imageError) {
        formDataToSend.append("image", selectedImage)
      }
      // If no image selected or invalid image, the backend will preserve the existing image

      await updateBlog(blog!._id, formDataToSend)
      setUpdateSuccess(true)

      // Clear the selected image after successful update
      setSelectedImage(null)
      setImagePreview(null)

      // Reset file input
      const fileInput = document.getElementById("image") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (err) {
      setError("An error occurred while updating the blog. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (error && !blog) {
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
                  blog?.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {blog?.isVisible ? "Published" : "Draft"}
              </span>
              {/* Preview Button */}
              <Link
                href={`/blogs/${blog?._id}`}
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
              <h2 className="font-semibold text-blue-900 mb-2 text-lg">{blog?.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Author:</span>
                  <span className="text-blue-800 ml-2">{blog?.author}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Created:</span>
                  <span className="text-blue-800 ml-2">{blog && formatDate(blog.createdAt)}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Last Updated:</span>
                  <span className="text-blue-800 ml-2">{blog && formatDate(blog.updatedAt)}</span>
                </div>
              </div>
              {/* Tags */}
              {blog?.tags && blog.tags.length > 0 && (
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
            {blog?.imageUrl && (
              <div className="ml-4 flex-shrink-0">
                <Image
                  src={blog.imageUrl || "/placeholder.svg"}
                  alt={blog.title}
                  width={96}
                  height={96}
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
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Edit Blog Content</h3>
              <p className="text-sm text-gray-600 mt-1">
                Make changes to your blog post. All changes will be saved when you submit the form.
              </p>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter blog title"
                />
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter author name"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>

                {/* Current Image Display */}
                {blog?.imageUrl && !imagePreview && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current image:</p>
                    <div className="relative inline-block">
                      <Image
                        src={blog.imageUrl || "/placeholder.svg"}
                        alt="Current blog image"
                        width={200}
                        height={150}
                        className="rounded-lg border border-gray-300 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 relative">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          width={200}
                          height={150}
                          className="rounded-lg border border-gray-300 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">New Image Selected:</h4>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>
                            <strong>Name:</strong> {selectedImage?.name}
                          </p>
                          <p>
                            <strong>Size:</strong>{" "}
                            {selectedImage ? `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB` : ""}
                          </p>
                          <p>
                            <strong>Type:</strong> {selectedImage?.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> a new image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                    </div>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}

                <p className="mt-2 text-sm text-gray-500">
                  Leave empty to keep the current image. Upload a new image to replace it.
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label htmlFor="isVisible" className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  id="isVisible"
                  name="isVisible"
                  value={formData.isVisible.toString()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="React, JavaScript, Web Development"
                />
                <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
              </div>

              {/* Scheduled Publish Date */}
              <div>
                <label htmlFor="scheduledPublishDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Publish Date
                </label>
                <input
                  type="datetime-local"
                  id="scheduledPublishDate"
                  name="scheduledPublishDate"
                  value={formData.scheduledPublishDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Leave empty to publish immediately</p>
              </div>

              {/* SEO Title */}
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SEO optimized title"
                />
              </div>

              {/* SEO Description */}
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description for search engines"
                />
              </div>

              {/* SEO Keywords */}
              <div>
                <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>Last saved: {blog && formatDate(blog.updatedAt)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/blogs")}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Reset Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Blog
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
