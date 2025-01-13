"use client"

import { useState } from 'react'

const exams = [
  { id: 1, name: "Data Structures", year: 2023, department: "Computer Science" },
  { id: 2, name: "Algorithms", year: 2023, department: "Computer Science" },
  { id: 3, name: "Database Management", year: 2022, department: "Information Technology" },
  { id: 4, name: "Web Development", year: 2022, department: "Software Engineering" },
  { id: 5, name: "Machine Learning", year: 2021, department: "Artificial Intelligence" },
]

export default function Exams() {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  const filteredExams = exams.filter(exam => 
    (!selectedDepartment || exam.department === selectedDepartment) &&
    (!selectedYear || exam.year.toString() === selectedYear)
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Exam Papers</h1>
      <div className="mb-4 flex space-x-4">
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
        </select>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Years</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>
      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">{exam.name}</h2>
            <p className="text-gray-600 mt-2">Year: {exam.year}</p>
            <p className="text-gray-600">Department: {exam.department}</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}

