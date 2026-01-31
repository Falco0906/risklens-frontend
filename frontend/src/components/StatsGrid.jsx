import { Activity, Users, DollarSign, AlertTriangle } from 'lucide-react'

function StatsGrid({ stats }) {
  const statCards = [
    {
      label: 'Total Signals',
      value: stats.total,
      icon: Activity
    },
    {
      label: 'HR Signals',
      value: stats.hr,
      icon: Users
    },
    {
      label: 'Finance Signals',
      value: stats.finance,
      icon: DollarSign
    },
    {
      label: 'Critical Signals',
      value: stats.critical,
      icon: AlertTriangle
    }
  ]

  return (
    <section className="stats-grid">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div className="stat-card" key={index}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <Icon size={16} className="stat-icon" />
          </div>
        )
      })}
    </section>
  )
}

export default StatsGrid
