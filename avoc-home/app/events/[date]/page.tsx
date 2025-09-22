import { db } from '@/lib/db'
import { events, roomFilters } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import EventsHeader from './components/EventsHeader/EventsHeader'

interface PageProps {
  params: {
    date: string
  }
  searchParams: {
    filter?: string
  }
}

export default async function EventsByDatePage({ params, searchParams }: PageProps) {
  const { date } = params
  const { filter } = searchParams

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Date Format</h1>
        <p>Please use the format YYYY-MM-DD (e.g., 2025-06-01)</p>
      </div>
    )
  }

  try {
    // Build the query conditions
    let whereConditions = eq(events.date, date)
    let filterInfo = null
    
    // Handle room filter if provided
    if (filter) {
      // First, get the room filter from the room_filters table
      const roomFilter = await db
        .select()
        .from(roomFilters)
        .where(eq(roomFilters.name, filter))
        .limit(1)
      
      if (roomFilter.length === 0) {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Filter</h1>
            <p className="mb-4">The filter "<span className="font-semibold">{filter}</span>" was not found.</p>
            <p className="text-gray-600">
              Please check the available filters on the <a href="/events" className="text-blue-600 hover:underline">events page</a>.
            </p>
          </div>
        )
      }
      
      if (roomFilter[0].display) {
        const displayRooms = roomFilter[0].display as string[]
        filterInfo = {
          name: roomFilter[0].name,
          rooms: displayRooms
        }
        
        // Filter events by room names in the display array
        whereConditions = and(
          whereConditions,
          inArray(events.roomName, displayRooms)
        )!
      }
    }

    // Query events for the specific date
    const eventsOnDate = await db
      .select()
      .from(events)
      .where(whereConditions)
      .orderBy(events.startTime)

    return (
      <div className="p-8">
        <EventsHeader date={date} filterInfo={filterInfo} filter={filter} />

        {eventsOnDate.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {filter ? `No events found matching "${filter}"` : 'No events scheduled for this date'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventsOnDate.map((event) => (
              <div key={event.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {event.eventName || event.lectureTitle || 'Untitled Event'}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {event.eventType}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <p className="text-gray-600">
                      {event.startTime && event.endTime 
                        ? `${event.startTime} - ${event.endTime}`
                        : event.startTime || 'Time TBD'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Room:</span>
                    <p className="text-gray-600">{event.roomName || 'TBD'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Organization:</span>
                    <p className="text-gray-600">{event.organization || 'N/A'}</p>
                  </div>
                </div>

                {event.instructorNames && Array.isArray(event.instructorNames) && event.instructorNames.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Instructors:</span>
                    <p className="text-gray-600">
                      {event.instructorNames.join(', ')}
                    </p>
                  </div>
                )}

                {event.resources && Array.isArray(event.resources) && event.resources.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Resources:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {event.resources.map((resource: any, index: number) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {typeof resource === 'string' ? resource : resource.name || 'Resource'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching events:', error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Events</h1>
        <p>There was an error loading events for this date. Please try again later.</p>
      </div>
    )
  }
}
