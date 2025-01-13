import Link from 'next/link'

const events = [
  { id: 1, title: "Annual Hackathon", date: "2024-04-15", location: "Main Campus Auditorium" },
  { id: 2, title: "Web Development Workshop", date: "2024-04-20", location: "Computer Science Building, Room 101" },
  { id: 3, title: "AI and Machine Learning Seminar", date: "2024-04-25", location: "Virtual Event" },
  { id: 4, title: "Code Review Best Practices", date: "2024-05-01", location: "Engineering Building, Room 205" },
  { id: 5, title: "Open Source Contribution Day", date: "2024-05-10", location: "Student Center" },
]

export default function Events() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <p className="text-gray-600 mt-2">Date: {event.date}</p>
            <p className="textI'll continue the text stream from the cut-off point:

text-gray-600 mt-2">Date: {event.date}</p>
            <p className="text-gray-600">Location: {event.location}</p>
            <Link href={`/events/${event.id}`} className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Learn More & Register
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

