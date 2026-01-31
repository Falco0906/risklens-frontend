import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ExecutiveSummary from './components/ExecutiveSummary'
import StatsGrid from './components/StatsGrid'
import RiskTrendCard from './components/RiskTrendCard'
import EventTimeline from './components/EventTimeline'
import EventInjection from './components/EventInjection'

// API base URL
const API_BASE_URL = 'https://risklens-backend-fvk6.onrender.com'


function App() {
  const [events, setEvents] = useState([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch events and summary in parallel
      const [eventsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/events`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/summary`).catch(err => ({ ok: false, error: err }))
      ])

      // Handle events response
      let eventsData = []
      if (eventsRes.ok && !eventsRes.error) {
        eventsData = await eventsRes.json()
        const newEvents = Array.isArray(eventsData) ? eventsData : []
        setEvents(newEvents)
      } else if (eventsRes.error) {
        console.error('Events fetch error:', eventsRes.error)
        // Keep existing events if available, don't clear on network error
        if (events.length === 0) {
          setError('Unable to connect to backend. Please ensure the server is running.')
        }
      } else {
        console.warn('Events endpoint returned non-OK status')
        if (events.length === 0) {
          setError('Failed to load events from backend.')
        }
      }

      // Handle summary response
      if (summaryRes.ok && !summaryRes.error) {
        const summaryData = await summaryRes.json()
        const newSummary = summaryData.summary || ''
        setSummary(newSummary)
      } else if (summaryRes.error) {
        console.error('Summary fetch error:', summaryRes.error)
        if (!summary) {
          setError('Unable to connect to backend')
        }
      } else {
        console.warn('Summary endpoint returned non-OK status')
        if (!summary) {
          setError('Failed to load summary from backend')
        }
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching data:', err)
      // Don't clear existing data on error - show what we have
      if (events.length === 0 && !summary) {
        setError(err.message || 'Failed to connect to backend')
      }
    } finally {
      setLoading(false)
    }
  }
  
// Auto-refresh DISABLED to save AI quota
// const interval = setInterval(fetchData, 30000)

  useEffect(() => {
    fetchData()
    return () => {}
  }, [])
  

  // Calculate stats from events
  const stats = {
    total: events.length,
    hr: events.filter(e => e.source_system?.toLowerCase() === 'hr').length,
    finance: events.filter(e => e.source_system?.toLowerCase() === 'finance').length,
    critical: events.filter(e =>
      e.severity?.toLowerCase() === 'critical' ||
      e.severity?.toLowerCase() === 'high'
    ).length
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header
          onRefresh={fetchData}
          loading={loading}
          lastUpdated={lastUpdated}
        />
        <div className="dashboard">
          <ExecutiveSummary
            summary={summary}
            loading={loading}
            error={error}
          />
          <EventInjection onEventCreated={fetchData} />
          <StatsGrid stats={stats} />
          <RiskTrendCard events={events} />
          <EventTimeline
            events={events}
            loading={loading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}


export default App
