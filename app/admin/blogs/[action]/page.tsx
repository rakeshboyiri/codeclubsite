import BlogForm from "../../../../components/admin/BlogForm"
import { getBlogPost } from "@/lib/blogActions"

export default async function BlogActionPage({ params }: { params: Promise<{ action: string }> }) {
  const { action } = await params
  const isEditing = action !== "new"
  const blogId = isEditing ? action.replace("edit/", "") : null
  const blog = blogId ? ((await getBlogPost(blogId)) ?? undefined) : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit Blog" : "Create New Blog"}</h1>
      <BlogForm blog={blog} />
    </div>
  )
}