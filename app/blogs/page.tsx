import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, ChevronRight } from "lucide-react"
import { getBlogPosts } from "@/lib/blogActions"
import { Button } from "@/components/ui/button"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.split(" ").length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return `${readTime} min read`
}


export default async function Blogs({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>
}) {
  const { page, tag } = await searchParams
  const pageNumber = page ? Number.parseInt(page) : 1
  const { blogs, totalPages, currentPage } = await getBlogPosts(pageNumber, tag)


  if (blogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">No Blogs Found</h1>
          <p className="text-gray-600">Check back later for new content!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">CodeClub Blog</h1>
          <p className="text-xl text-gray-600">Discover the latest in technology and programming</p>
        </div>

        {/* Featured Blog */}
        {blogs.length > 0 && (
          <div className="relative h-[500px] rounded-xl overflow-hidden group">
            <Image
              src={blogs[0].imageUrl || "/placeholder.svg?height=500&width=1200"}
              alt={blogs[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {blogs[0].tags.map((tag, index) => (
                  <Badge key={index} className="bg-primary/80 hover:bg-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link href={`/blogs/${blogs[0]._id}`}>
                <h1 className="text-4xl font-bold mb-4 hover:text-primary transition-colors cursor-pointer">
                  {blogs[0].title}
                </h1>
              </Link>
              <p className="text-lg mb-6 text-gray-200 line-clamp-2">{blogs[0].content.substring(0, 200)}...</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">{blogs[0].author.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-medium">{blogs[0].author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>{formatDate(blogs[0].createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{calculateReadTime(blogs[0].content)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {blogs.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.slice(1).map((blog) => (
              <Card key={blog._id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/blogs/${blog._id}`}>
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={blog.imageUrl || "/placeholder.svg?height=200&width=400"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{calculateReadTime(blog.content)}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{blog.content.substring(0, 150)}...</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {blog.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{blog.author}</span>
                        <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <Link href={`/blogs?page=${currentPage - 1}${tag ? `&tag=${tag}` : ""}`}>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Link key={pageNum} href={`/blogs?page=${pageNum}${tag ? `&tag=${tag}` : ""}`}>
                    <Button variant={currentPage === pageNum ? "default" : "outline"} size="sm">
                      {pageNum}
                    </Button>
                  </Link>
                )
              })}
            </div>

            <Link href={`/blogs?page=${currentPage + 1}${tag ? `&tag=${tag}` : ""}`}>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </Link>
          </div>
        )}

        {/* Blog Stats */}
        <div className="bg-gray-50 rounded-lg p-6 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-primary">{blogs.length}</h3>
              <p className="text-gray-600">Articles on this page</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{totalPages}</h3>
              <p className="text-gray-600">Total pages</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">
                {blogs.reduce((acc, blog) => acc + blog.tags.length, 0)}
              </h3>
              <p className="text-gray-600">Total tags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
