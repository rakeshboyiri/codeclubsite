"use client"

//edit blog page component
import React from 'react'
import { useParams } from "next/navigation"
import { createBlog, updateBlog } from "@/lib/blogActions"
export default function EditBlog() {
    const params = useParams()
    // console.log(params)
    return (
        <div>
            <h1>Edit Blog</h1>
        </div>
    )
}