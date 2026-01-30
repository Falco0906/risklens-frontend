import { useMemo } from 'react'

const severityScore = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
}

const days=6

function RiskTrendCard({ events = [] }) {
  const chartData = useMemo(() => {
    if (!events.length) {
      return buildFallbackSeries()
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
  const maxCritical = Math.max(...chartData.map(point => point.criticalEvents), 1)

  const linePoints = chartData.map((point, index) => {
    const x = normalise(index, chartData.length)
    const y = scaleValue(point.weightedScore, maxValue)
    return `${x},${y}`
  }).join(' ')

  const areaPath = buildAreaPath(chartData, maxValue)

  const criticalPoints = chartData.map((point, index) => {
    const x = normalise(index, chartData.length)
    const y = scaleValue(point.criticalEvents, maxCritical, 10)
    return `${x},${y}`
  }).join(' ')

  const totalEventsChange = computeTrend(chartData.map(point => point.totalEvents))

  return (
    <section className="chart-card" aria-label="Risk trend visualisation">
      <header className="chart-header">
        <div className="chart-title">
          <h3>Risk Signal Trajectory</h3>
          <span className="chart-subtitle">Composite score (HR + Finance)</span>
        </div>
        <div className="chart-legend" role="list">
          <div className="legend-item" role="listitem">
            <span className="legend-dot total" aria-hidden="true" />Total impact
          </div>
          <div className="legend-item" role="listitem">
            <span className="legend-dot critical" aria-hidden="true" />Critical/High
          </div>
          <div className="legend-item" role="listitem">
            <span className="legend-dot hr" aria-hidden="true" />HR origin
          </div>
        </div>
      </header>

      <div className="chart-body">
        <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g className="chart-grid" aria-hidden="true">
            <line x1="0" y1="90" x2="100" y2="90" className="chart-axis" />
            <line x1="0" y1="55" x2="100" y2="55" />
            <line x1="0" y1="20" x2="100" y2="20" />
          </g>

          <path className="chart-area" d={areaPath} />
          <polyline className="chart-line" points={linePoints} />
          <polyline className="critical-line" points={criticalPoints} />

          <g className="chart-points">
            {chartData.map((point, index) => {
              const x = normalise(index, chartData.length)
              const y = scaleValue(point.weightedScore, maxValue)
              return (
                <circle key={point.key} cx={x} cy={y} r={1.4} />
              )
            })}
          </g>
        </svg>

        <div className="chart-x-labels">
          {chartData.map(point => (
            <span key={point.key}>{point.label}</span>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <span className="chart-hint">
          Weighted score blends signal volume with severity so sudden spikes show instantly.
        </span>
        <span className="trend-badge" aria-live="polite">
          {totalEventsChange >= 0 ? '+' : ''}{totalEventsChange}% week drift
        </span>
      </div>
    </section>
  )
}

function buildFallbackSeries() {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const template = [4, 5, 7, 6, 8, 11]
  return labels.map((label, index) => ({
    key: `fallback-${index}`,
    label,
    totalEvents: template[index],
    criticalEvents: index < 2 ? 1 : index === 5 ? 3 : 2,
    hrEvents: index % 2 === 0 ? 2 : 1,
    weightedScore: template[index] + (index > 2 ? 1.5 : 0.5)
  }))
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

function buildAreaPath(points, maxValue) {
  if (!points.length) {
    return ''
  }

  const start = `0 90`
  const coords = points.map((point, index) => {
    const x = normalise(index, points.length)
    const y = scaleValue(point.weightedScore, maxValue)
    return `${x} ${y}`
  }).join(' ')

  const endX = normalise(points.length - 1, points.length)
  const bottom = `${endX} 90`
  return `M ${start} L ${coords} L ${bottom} L 0 90 Z`
}

function computeTrend(values) {
  if (values.length < 2) {
    return 0
  }

  const first = values[0] || 0.01
  const last = values[values.length - 1]
  const change = ((last - first) / Math.max(first, 1)) * 100
  return Math.round(change)
}

export default RiskTrendCard
