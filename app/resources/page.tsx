"use client"

import { useState } from 'react'

const resources = [
  { id: 1, title: "JavaScript: The Good Parts", type: "eBook", category: "Web Development" },
  { id: 2, title: "Introduction to Algorithms", type: "Video Series", category: "Algorithms" },
  { id: 3, title: "Git & GitHub Cheat Sheet", type: "PDF", category: "Version Control" },
  { id: 4, title: "Machine Learning Basics", type: "Online Course", category: "Artificial Intelligence" },
  { id: 5, title: "Clean Code: A Handbook of Agile Software Craftsmanship", type: "eBook", category: "Software Engineering" },
]

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("")

  const filteredResources = selectedCategory
    ? resources.filter(resource => resource.category === selectedCategory)
    : resources

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Learning Resources</h1>
      <div className="mb-4">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Algorithms">Algorithms</option>
          <option value="Version Control">Version Control</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Software Engineering">Software Engineering</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">{resource.title}</h2>
            <p className="text-gray-600 mt-2">Type: {resource.type}</p>
            <p className="text-gray-600">Category: {resource.category}</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Access Resource</button>
          </div>
        ))}
      </div>
    </div>
  )
}

