// import Link from 'next/link'
// import { getBlogPosts } from '@/lib/blogActions'
// import BlogList from '../../../components/admin/BlogList'

// export default async function BlogManagement({ searchParams }: { searchParams: { page?: string } }) {
//   const page = searchParams.page ? parseInt(searchParams.page) : 1
//   const blogData = await getBlogPosts(page)

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Blog Management</h1>
//         <Link 
//           href="/admin/blogs/new" 
//           className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//         >
//           Add New Blog
//         </Link>
//       </div>
//       <BlogList initialBlogData={blogData} />
//     </div>
//   )
// }

import Link from "next/link"
import { getBlogPosts } from "@/lib/blogActions"
import BlogList from '../../../components/admin/BlogList'

export default async function BlogManagement({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const pageNumber = page ? Number.parseInt(page) : 1
  const blogData = await getBlogPosts(pageNumber)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Link href="/admin/blogs/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Add New Blog
        </Link>
      </div>
      <BlogList initialBlogData={blogData} />
    </div>
  )
}