import { useMemo } from 'react'

const severityScore = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
}

const days = 6

function RiskTrendCard({ events = [] }) {
  const chartData = useMemo(() => {
    if (!events.length) {
      return []
    }

    const now = new Date()
    const dailyBuckets = Array.from({ length: days }, (_, index) => {
      const day = new Date(now)
      day.setDate(now.getDate() - (days - 1 - index))
      day.setHours(0, 0, 0, 0)
      return {
        key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalEvents: 0,
        criticalEvents: 0,
        hrEvents: 0,
        weightedScore: 0
      }
    })

    const bucketsByKey = Object.fromEntries(dailyBuckets.map(bucket => [bucket.key, bucket]))

    events.forEach(event => {
      const eventDate = new Date(event.created_at || event.timestamp || Date.now())
      eventDate.setHours(0, 0, 0, 0)
      const bucketKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`

      const bucket = bucketsByKey[bucketKey]
      if (!bucket) {
        return
      }

      const severity = (event.severity || '').toLowerCase()
      const source = (event.source_system || '').toLowerCase()

      bucket.totalEvents += 1
      bucket.weightedScore += severityScore[severity] || 1

      if (severity === 'critical' || severity === 'high') {
        bucket.criticalEvents += 1
      }

      if (source === 'hr') {
        bucket.hrEvents += 1
      }
    })

    let syntheticCarry = 0
    const smoothed = dailyBuckets.map(bucket => {
      const adjustedScore = bucket.weightedScore + syntheticCarry
      syntheticCarry = Math.max(bucket.weightedScore * 0.15, syntheticCarry * 0.35)
      return {
        ...bucket,
        weightedScore: Math.max(adjustedScore, bucket.totalEvents || 0.6)
      }
    })

    return smoothed
  }, [events])

  const maxValue = Math.max(...chartData.map(point => point.weightedScore), 1)

  const linePoints = chartData.map((point, index) => {
    const x = normalise(index, chartData.length)
    const y = scaleValue(point.weightedScore, maxValue)
    return `${x},${y}`
  }).join(' ')

  if (!chartData.length) {
    return null
  }

  return (
    <section className="chart-card">
      <div className="chart-header">
        <h3>Risk Trajectory</h3>
      </div>
      <div className="chart-body">
        <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g className="chart-grid" aria-hidden="true">
            <line x1="0" y1="90" x2="100" y2="90" className="chart-axis" />
            <line x1="0" y1="55" x2="100" y2="55" />
            <line x1="0" y1="20" x2="100" y2="20" />
          </g>
          <polyline className="chart-line" points={linePoints} />
        </svg>
        <div className="chart-x-labels">
          {chartData.map(point => (
            <span key={point.key}>{point.label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function normalise(index, length) {
  if (length <= 1) {
    return 0
  }
  const step = 100 / (length - 1)
  return Number((index * step).toFixed(2))
}

function scaleValue(value, max, topPadding = 6) {
  const height = 100 - topPadding - 12
  const safeMax = Math.max(max, 1)
  const ratio = Math.min(value / safeMax, 1)
  const y = topPadding + (1 - ratio) * height
  return Number(y.toFixed(2))
}


export default RiskTrendCard
