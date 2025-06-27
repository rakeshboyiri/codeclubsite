"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Blog } from "@/types/blog"
import { createBlog, updateBlog } from "@/lib/blogActions"

interface BlogFormProps {
  blog?: Blog
  categories?: string[]
}

export default function BlogForm({ blog, categories = [] }: BlogFormProps) {
  const router = useRouter()
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "isVisible") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    // Reset the file input
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "codeclub")
    data.append("cloud_name", "dtyh0rle2")

    const response = await fetch("https://api.cloudinary.com/v1_1/dtyh0rle2/image/upload", {
      method: "POST",
      body: data,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary")
    }

    const result = await response.json()
    return result.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("1")
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    console.log("2")
    try {
      let imageUrl = formData.imageUrl

      // Upload image to Cloudinary if a new image is selected
      if (selectedImage) {
        setIsUploadingImage(true)
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage)
          console.log(imageUrl)

          // Update form data with the new image URL
          setFormData((prevFormData) => ({
            ...prevFormData,
            imageUrl
          }))
          // console.log(formData.imageUrl)
          console.log("3")
        } catch (uploadError) {
          throw new Error("Failed to upload image. Please try again.")
        } finally {
          console.log(formData.author)
          console.log(formData.imageUrl)
          setIsUploadingImage(false)
        }
      }

      // Prepare form data for submission
      const formDataToSend = new FormData()

      // Add all form fields including the updated imageUrl
      const updatedFormData = { ...formData, imageUrl }
      console.log(updatedFormData)
      Object.entries(updatedFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key.toString(), value.toString())
        }
      })

     
      await createBlog(formDataToSend)
      // console.log(formData)
      // console.log(formDataToSend[0])
      // for (let pair of formDataToSend.entries()) {
      //   console.log(`${pair[0]}: ${pair[1]}`)
      // }
      
      router.push("/admin/blogs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving the blog. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
      setIsUploadingImage(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Author Field */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          Author
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />

        {/* Image Preview */}
        {(imagePreview || formData.imageUrl) && (
          <div className="mt-2">
            <img src={imagePreview || formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
            <button type="button" onClick={removeImage} className="mt-2 text-sm text-red-600 hover:text-red-800">
              Remove Image
            </button>
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label htmlFor="isVisible" className="block text-sm font-medium text-gray-700">
          Visibility
        </label>
        <select
          id="isVisible"
          name="isVisible"
          value={formData.isVisible.toString()}
          onChange={handleSelectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="true">Visible</option>
          <option value="false">Hidden</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="tag1, tag2, tag3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* SEO Title */}
      <div>
        <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
          SEO Title
        </label>
        <input
          type="text"
          id="seoTitle"
          name="seoTitle"
          value={formData.seoTitle}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* SEO Description */}
      <div>
        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
          SEO Description
        </label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          value={formData.seoDescription}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* SEO Keywords */}
      <div>
        <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
          SEO Keywords (comma-separated)
        </label>
        <input
          type="text"
          id="seoKeywords"
          name="seoKeywords"
          value={formData.seoKeywords}
          onChange={handleChange}
          placeholder="keyword1, keyword2, keyword3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Scheduled Publish Date */}
      <div>
        <label htmlFor="scheduledPublishDate" className="block text-sm font-medium text-gray-700">
          Scheduled Publish Date
        </label>
        <input
          type="datetime-local"
          id="scheduledPublishDate"
          name="scheduledPublishDate"
          value={formData.scheduledPublishDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploadingImage ? "Uploading Image..." : isSubmitting ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
        </button>
      </div>
    </form>
  )
}
