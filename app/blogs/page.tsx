import Link from 'next/link';
import { getBlogPosts } from '@/lib/blogActions';

export default async function Blogs() {
  const blogData = await getBlogPosts();
  console.log(blogData.blogs);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Blogs</h1>
      <div className="space-y-4">
        {blogData.blogs.map((blog) => (
          <div key={blog._id} className="bg-white p-6 rounded shadow">
            <Link href={`/blogs/${blog._id}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {blog.title}
            </Link>
            <p className="text-gray-600 mt-2">
              By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
