import { getBlogPost } from "@/lib/blogActions"
import Image from "next/image"
import { Calendar, User, Tag, Clock } from "lucide-react"
import { notFound } from "next/navigation"

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const blog = await getBlogPost(params.id)

  if (!blog) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src={blog.imageUrl || "/placeholder.svg?height=600&width=1200"}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{blog.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                {blog.updatedAt !== blog.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Updated {formatDate(blog.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SEO Title (if different from main title) */}
          {blog.seoTitle && blog.seoTitle !== blog.title && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">SEO Title</h2>
              <p className="text-gray-600">{blog.seoTitle}</p>
            </div>
          )}

          {/* SEO Description */}
          {blog.seoDescription && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{blog.seoDescription}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 text-lg leading-relaxed">{formatContent(blog.content)}</div>
          </div>

          {/* SEO Keywords */}
          {blog.seoKeywords && blog.seoKeywords.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {blog.seoKeywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Publish Info */}
          {blog.scheduledPublishDate && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Scheduled to publish: {formatDate(blog.scheduledPublishDate)}
                </span>
              </div>
            </div>
          )}

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Written by {blog.author}</p>
                  <p className="text-sm text-gray-600">Published on {formatDate(blog.createdAt)}</p>
                </div>
              </div>

              {/* Share buttons placeholder */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Share
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Bookmark
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </article>
  )
}
