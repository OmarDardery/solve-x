import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { 
  Calendar, 
  Building2, 
  ExternalLink, 
  Search,
  Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export function Events() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title?.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query) ||
            event.organization?.name?.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, events])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllEvents()
      const eventsData = Array.isArray(response) ? response : []
      setEvents(eventsData)
      setFilteredEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const openDetailModal = (event) => {
    setSelectedEvent(event)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">
          Discover events from organizations and companies
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events by title, description, or organization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No events found' : 'No events available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Check back later for upcoming events'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.ID} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openDetailModal(event)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                {event.date && (
                  <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {event.description}
                  </p>
                )}
                
                {/* Organization Info */}
                {event.organization && (
                  <Link
                    to={`/organizations/${event.organization.ID}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-600 truncate hover:underline">
                        {event.organization.name}
                      </p>
                      <p className="text-xs text-gray-500">Click to view details</p>
                    </div>
                  </Link>
                )}

                {/* Quick Links */}
                <div className="flex gap-2 mt-4">
                  {event.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(event.link, '_blank')
                      }}
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Learn More
                    </Button>
                  )}
                  {event.sign_up_link && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(event.sign_up_link, '_blank')
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Sign Up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        title={selectedEvent?.title || 'Event Details'}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Date */}
            {selectedEvent.date && (
              <div className="flex items-center gap-2 text-purple-600">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{selectedEvent.date}</span>
              </div>
            )}

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About This Event</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}

            {/* Organization Details */}
            {selectedEvent.organization && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Hosted by
                </h4>
                <Link
                  to={`/organizations/${selectedEvent.organization.ID}`}
                  onClick={closeDetailModal}
                  className="block"
                >
                  <Card className="bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <h5 className="text-lg font-semibold text-purple-600 mb-1 hover:underline">
                        {selectedEvent.organization.name}
                      </h5>
                      <p className="text-sm text-gray-500">Click to view organization details and all events</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedEvent.link && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(selectedEvent.link, '_blank')}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              )}
              {selectedEvent.sign_up_link && (
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedEvent.sign_up_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sign Up Now
                </Button>
              )}
              {!selectedEvent.link && !selectedEvent.sign_up_link && (
                <Button variant="outline" onClick={closeDetailModal} className="w-full">
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
