'use server'

import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Blog, PaginatedBlogs } from '@/types/blog'

const ITEMS_PER_PAGE = 10

export async function getBlogPosts(page: number = 1, tag?: string): Promise<PaginatedBlogs> {
  const client = await clientPromise
  const db = client.db('codeclub')
  
  const query: any = { 
    $or: [
      { isVisible: true },
      { scheduledPublishDate: { $lte: new Date() } }
    ]
  }
  
  if (tag) {
    query.tags = tag
  }

  const totalItems = await db.collection('blogs').countDocuments(query)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const blogs = await db.collection('blogs')
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray()

  return {
    blogs: blogs.map(blog => ({
      ...blog,
      _id: blog._id.toString(),
    })) as Blog[],
    totalPages,
    currentPage: page
  }
}

export async function getBlogPost(id: string): Promise<Blog | null> {
  const client = await clientPromise
  const db = client.db('codeclub')
  const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) })
  if (blog) {
    return { ...blog, _id: blog._id.toString() } as Blog
  }
  return null
}

export async function createBlog(formData: FormData): Promise<Blog> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const blogData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    author: formData.get('author') as string,
    createdAt: new Date(),
    updatedAt: new Date(),
    isVisible: formData.get('isVisible') === 'true',
    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
    scheduledPublishDate: formData.get('scheduledPublishDate') as string || undefined,
    seoTitle: formData.get('seoTitle') as string,
    seoDescription: formData.get('seoDescription') as string,
    seoKeywords: (formData.get('seoKeywords') as string).split(',').map(keyword => keyword.trim()),
    imageUrl: '',
    
  }

  const image = formData.get('image') as File
  if (image) {
    const imageBuffer = await image.arrayBuffer()
    const imageData = new Uint8Array(imageBuffer)
    const imageResult = await db.collection('images').insertOne({
      data: imageData,
      contentType: image.type,
    })
    blogData.imageUrl = `/api/images/${imageResult.insertedId}`
  }

  const result = await db.collection('blogs').insertOne(blogData)
  return { 
    ...blogData, 
    _id: result.insertedId.toString(), 
    createdAt: blogData.createdAt.toISOString(), 
    updatedAt: blogData.updatedAt.toISOString() 
  } as Blog
}

export async function updateBlog(id: string, formData: FormData): Promise<Blog> {
  const client = await clientPromise
  const db = client.db('codeclub')

  const blogData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    author: formData.get('author') as string,
    updatedAt: new Date(),
    isVisible: formData.get('isVisible') === 'true',
    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
    scheduledPublishDate: formData.get('scheduledPublishDate') as string || undefined,
    seoTitle: formData.get('seoTitle') as string,
    seoDescription: formData.get('seoDescription') as string,
    seoKeywords: (formData.get('seoKeywords') as string).split(',').map(keyword => keyword.trim()),
    imageUrl: '', 
    createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString(),
  }

  const image = formData.get('image') as File
  if (image) {
    const imageBuffer = await image.arrayBuffer()
    const imageData = new Uint8Array(imageBuffer)
    const imageResult = await db.collection('images').insertOne({
      data: imageData,
      contentType: image.type,
    })
    blogData.imageUrl = `/api/images/${imageResult.insertedId}`
  }

  await db.collection('blogs').updateOne(
    { _id: new ObjectId(id) },
    { $set: blogData }
  )

  return { ...blogData, updatedAt: blogData.updatedAt.toISOString(), _id: id } as Blog
}

export async function deleteBlog(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('codeclub')
  await db.collection('blogs').deleteOne({ _id: new ObjectId(id) })
}

export async function toggleBlogVisibility(id: string): Promise<Blog> {
  const client = await clientPromise
  const db = client.db('codeclub')
  
  const blog = await db.collection('blogs').findOne({ _id: new ObjectId(id) })
  if (!blog) {
    throw new Error('Blog not found')
  }

  const newVisibility = !blog.isVisible
  await db.collection('blogs').updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVisible: newVisibility } }
  )

  return { ...blog, _id: id, isVisible: newVisibility } as Blog
}

export async function getBlogTags(): Promise<string[]> {
  const client = await clientPromise
  const db = client.db('codeclub')
  
  const tags = await db.collection('blogs').distinct('tags')
  return tags
}

