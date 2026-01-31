import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

function EventTimeline({ events, loading, error }) {
  const [activeTab, setActiveTab] = useState('all')
  
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true
    if (activeTab === 'hr') return event.source_system?.toLowerCase() === 'hr'
    if (activeTab === 'finance') return event.source_system?.toLowerCase() === 'finance'
    if (activeTab === 'critical') {
      const severity = event.severity?.toLowerCase()
      return severity === 'critical' || severity === 'high'
    }
    return true
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'hr', label: 'HR' },
    { id: 'finance', label: 'Finance' }
  ]

  return (
    <section className="events-section">
      <div className="events-header">
        <h3>Signal Timeline</h3>
        <div className="events-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`events-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      <div className="events-list">
        {loading && events.length === 0 ? (
          <div className="empty-state">
            <span>Loading...</span>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="empty-state">
            <span>No events</span>
          </div>
        ) : (
          sortedEvents.map((event, index) => (
            <EventItem 
              key={event.id || index} 
              event={event} 
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </section>
  )
}

function EventItem({ event, formatTime }) {
  const severity = (event.severity || 'medium').toLowerCase()
  
  return (
    <div className="event-item">
      <div className={`severity-dot ${severity}`}></div>
      <div className="event-content">
        <div className="event-row">
          <span className="event-type">{event.event_type}</span>
          <span className="event-source">{event.source_system}</span>
          <span className="event-time">{formatTime(event.created_at)}</span>
        </div>
        <div className="event-description">{event.description}</div>
      </div>
    </div>
  )
}

export default EventTimeline
