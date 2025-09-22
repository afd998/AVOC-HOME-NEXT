import Link from 'next/link'
import { db } from '@/lib/db'
import { roomFilters } from '@/lib/db/schema'

export default async function EventsPage() {
  // Get available room filters
  const availableFilters = await db
    .select({
      name: roomFilters.name,
      display: roomFilters.display,
      isDefault: roomFilters.default
    })
    .from(roomFilters)
    .orderBy(roomFilters.name)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <div className="flex gap-4">
          <Link 
            href={`/events/${today}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Today's Events
          </Link>
          <Link 
            href={`/events/${tomorrowStr}`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tomorrow's Events
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Room Filters</h2>
        {availableFilters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFilters.map((filter) => (
              <div key={filter.name} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  {filter.name}
                  {filter.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Rooms: {Array.isArray(filter.display) ? filter.display.join(', ') : 'No rooms'}
                </p>
                <Link 
                  href={`/events/${today}?filter=${encodeURIComponent(filter.name || '')}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Today's Events →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No room filters available.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search by Date</h2>
        <p className="text-gray-600 mb-4">
          Navigate to events for a specific date using the format: <code className="bg-gray-100 px-2 py-1 rounded">/events/YYYY-MM-DD</code>
        </p>
        <p className="text-gray-600 mb-4">
          You can also add a room filter: <code className="bg-gray-100 px-2 py-1 rounded">/events/YYYY-MM-DD?filter=filter_name</code>
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Example URLs:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><code>/events/2025-06-01</code> - All events on June 1, 2025</li>
            <li><code>/events/2025-06-01?filter=lecture_rooms</code> - Events in lecture rooms on June 1, 2025</li>
            <li><code>/events/2025-06-01?filter=lab_rooms</code> - Events in lab rooms on June 1, 2025</li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Date Picker</h2>
        <p className="text-gray-600 mb-4">Select a date to view events:</p>
        <input 
          type="date" 
          className="border border-gray-300 rounded-lg px-3 py-2"
          defaultValue={today}
          onChange={(e) => {
            if (e.target.value) {
              window.location.href = `/events/${e.target.value}`
            }
          }}
        />
      </div>
    </div>
  )
}
