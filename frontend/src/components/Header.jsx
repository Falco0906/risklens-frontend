import { RefreshCw } from 'lucide-react'

function Header({ onRefresh, loading, lastUpdated }) {
  const formatTime = (date) => {
    if (!date) return 'just now'
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 10) return 'just now'
    if (diffSecs < 60) return `${diffSecs}s ago`
    
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1>RiskLens</h1>
        <span className="header-subtitle">Operational Macro Telemetry</span>
      </div>
      
      <div className="header-right">
        <span className="header-timestamp">
          Updated {formatTime(lastUpdated)}
        </span>
        <button 
          className={`header-refresh ${loading ? 'loading' : ''}`}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  )
}

export default Header
