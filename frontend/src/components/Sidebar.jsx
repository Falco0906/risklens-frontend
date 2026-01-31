import { LayoutDashboard, BarChart3, FileText, Users, Settings } from 'lucide-react'

function Sidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
    { id: 'reports', label: 'Reports', icon: FileText, active: false },
    { id: 'team', label: 'Team', icon: Users, active: false },
    { id: 'settings', label: 'Settings', icon: Settings, active: false }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-menu">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`sidebar-item ${item.active ? 'active' : ''}`}
                title={`${item.label} (read-only)`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
