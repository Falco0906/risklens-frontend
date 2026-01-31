import { useState } from 'react'
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

function EventInjection({ onEventCreated }) {
  const [error, setError] = useState(null)
  
  // Track button states independently
  const [buttonStates, setButtonStates] = useState({
    hr: { loading: false, success: false },
    finance: { loading: false, success: false },
    critical: { loading: false, success: false }
  })

  const injectEvent = async (scenario) => {
    // Set loading state for this specific button only
    setButtonStates(prev => ({
      ...prev,
      [scenario]: { loading: true, success: false }
    }))
    setError(null)
    
    let eventData
    let eventDetails = { source: '', severity: '', type: '' }
    
    switch (scenario) {
      case 'hr':
        eventDetails = { source: 'hr', severity: 'medium', type: 'Hiring Delay' }
        eventData = {
          source_system: 'hr',
          event_type: 'Hiring Delay',
          severity: 'medium',
          description: 'Hiring freeze delayed warehouse onboarding by 14 days',
          raw_json: {
            team: 'Fulfillment',
            delay_days: 14,
            reason: 'Budget approval pending',
            positions_affected: 3,
            impact: 'Q2 fulfillment capacity reduced by 12%'
          }
        }
        break
      case 'finance':
        eventDetails = { source: 'finance', severity: 'high', type: 'Invoice Approval Delay' }
        eventData = {
          source_system: 'finance',
          event_type: 'Invoice Approval Delay',
          severity: 'high',
          description: 'Invoice approval delay for Tier-1 packaging supplier',
          raw_json: {
            vendor: 'PackRight Ltd',
            invoice_amount: 184750,
            delay_days: 7,
            risk_level: 'Service level downgrade if not resolved within 48 hours'
          }
        }
        break
      case 'critical':
        eventDetails = { source: 'hr', severity: 'critical', type: 'Critical Chain Reaction Detected' }
        eventData = {
          source_system: 'hr',
          event_type: 'Critical Chain Reaction Detected',
          severity: 'critical',
          description: 'Cascading risk: HR hiring delay + Finance payment delay = projected 18% fulfillment capacity reduction within 3 weeks',
          raw_json: {
            affected_systems: ['hr', 'finance'],
            projected_impact: '18% fulfillment capacity reduction',
            timeline: '3 weeks',
            intervention_required: true,
            risk_factors: [
              'Warehouse staffing shortage',
              'Supplier payment delays',
              'Inventory buffer depletion'
            ]
          }
        }
        break
      default:
        return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        let errorMessage = `Failed to inject event: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = Array.isArray(errorData.detail) 
              ? errorData.detail.map(d => d.msg || d).join(', ')
              : errorData.detail
          }
        } catch {
          errorMessage = `Failed to inject event: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Show success state for this button
      setButtonStates(prev => ({
        ...prev,
        [scenario]: { loading: false, success: true }
      }))

      // Pass event details to parent and trigger refresh
      if (onEventCreated) {
        onEventCreated(eventDetails)
      }

      // Clear success state after ~1s
      setTimeout(() => {
        setButtonStates(prev => ({
          ...prev,
          [scenario]: { loading: false, success: false }
        }))
      }, 1000)
    } catch (err) {
      console.error('Error injecting event:', err)
      setError(err.message)
      setButtonStates(prev => ({
        ...prev,
        [scenario]: { loading: false, success: false }
      }))
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <section className="scenario-simulator">
      <div className="scenario-simulator-header">
        <h3>Operational Event Injection</h3>
        <p className="scenario-simulator-subtitle">
          Inject operational events to test risk detection
        </p>
      </div>
      
      {error && (
        <div className="scenario-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <div className="scenario-buttons">
        <button
          className={`scenario-btn hr ${buttonStates.hr.loading ? 'loading' : ''} ${buttonStates.hr.success ? 'success' : ''}`}
          onClick={() => injectEvent('hr')}
          disabled={buttonStates.hr.loading}
          title="Inject HR hiring delay event"
        >
          {buttonStates.hr.loading ? (
            <>
              <Loader2 size={16} className="spinning" />
              Injecting...
            </>
          ) : buttonStates.hr.success ? (
            <>
              <CheckCircle size={16} />
              Injected
            </>
          ) : (
            <>
              <Play size={16} />
              Inject HR Delay
            </>
          )}
        </button>
        
        <button
          className={`scenario-btn finance ${buttonStates.finance.loading ? 'loading' : ''} ${buttonStates.finance.success ? 'success' : ''}`}
          onClick={() => injectEvent('finance')}
          disabled={buttonStates.finance.loading}
          title="Inject Finance payment delay event"
        >
          {buttonStates.finance.loading ? (
            <>
              <Loader2 size={16} className="spinning" />
              Injecting...
            </>
          ) : buttonStates.finance.success ? (
            <>
              <CheckCircle size={16} />
              Injected
            </>
          ) : (
            <>
              <Play size={16} />
              Inject Finance Block
            </>
          )}
        </button>
        
        <button
          className={`scenario-btn critical ${buttonStates.critical.loading ? 'loading' : ''} ${buttonStates.critical.success ? 'success' : ''}`}
          onClick={() => injectEvent('critical')}
          disabled={buttonStates.critical.loading}
          title="Inject critical chain reaction event"
        >
          {buttonStates.critical.loading ? (
            <>
              <Loader2 size={16} className="spinning" />
              Injecting...
            </>
          ) : buttonStates.critical.success ? (
            <>
              <CheckCircle size={16} />
              Injected
            </>
          ) : (
            <>
              <Play size={16} />
              Inject Critical Chain Reaction
            </>
          )}
        </button>
      </div>
    </section>
  )
}

export default EventInjection

