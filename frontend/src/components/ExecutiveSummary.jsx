import { AlertCircle } from 'lucide-react'

function ExecutiveSummary({ summary, loading, error }) {
  const formatSummaryContent = (text) => {
    if (!text) return null
    
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) {
        return <br key={index} />
      }
      return <p key={index}>{trimmedLine}</p>
    })
  }
  
  return (
    <section className="executive-summary">
      <div className="summary-header">
        <h3>Executive Risk Brief</h3>
        <span className="summary-subtitle">Cross-functional operational risk</span>
      </div>
      
      {error && (
        <div className="error-banner">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="summary-loading">
          <span>Loading...</span>
        </div>
      ) : summary ? (
        <div className="summary-content">
          {formatSummaryContent(summary)}
        </div>
      ) : !error ? (
        <div className="empty-state">
          <p>No summary available</p>
        </div>
      ) : null}
    </section>
  )
}

export default ExecutiveSummary
