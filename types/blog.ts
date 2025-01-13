export interface Blog {
    _id: string
    title: string
    content: string
    author: string
    createdAt: string
    updatedAt: string
    isVisible: boolean
    imageUrl?: string
    tags: string[]
    scheduledPublishDate?: string
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string[]
  }
  
  export interface PaginatedBlogs {
    blogs: Blog[]
    totalPages: number
    currentPage: number
  }
  
  