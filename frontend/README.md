# RiskLens Frontend

AI Control Tower for Operational Risk - Executive Dashboard

## 2026 Design Refresh

The dashboard now ships with a futuristic light theme, tactile button states, and the Risk Trend composite chart so stakeholders can track severity drift without leaving the main view. All primary screens were rebuilt around high-key neutrals, layered glass surfaces, and animated micro-interactions that keep the experience energetic without overwhelming decision makers.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Backend API Connection

The frontend expects these endpoints from your backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/events` | GET | Returns list of HR & Finance exception events |
| `/summary` | GET | Returns AI-generated executive summary |

### Expected Response Formats

**GET /events**
```json
{
  "events": [
    {
      "id": 1,
      "source_system": "HR",
      "event_type": "Mass Resignation Alert",
      "severity": "critical",
      "description": "3 senior operators submitted resignations",
      "created_at": "2026-01-30T10:30:00Z"
    }
  ]
}
```

**GET /summary**
```json
{
  "summary": "⚠️ HIGH RISK ASSESSMENT: Multiple signals indicate..."
}
```

## Configuration

Set the `VITE_API_URL` environment variable to point to your backend:

```bash
# .env.local
VITE_API_URL=http://localhost:8000
```

## Demo Mode

If the backend is unavailable, the frontend automatically displays demo data for presentation purposes. Demo mode mirrors real production payloads so leaders can rehearse reviews even when the services are offline.

## Project Structure

```
src/
├── App.jsx              # Main app with data fetching
├── index.css            # All styles
├── main.jsx             # Entry point
└── components/
    ├── Sidebar.jsx      # Navigation sidebar
    ├── Header.jsx       # Top header with refresh
    ├── ExecutiveSummary.jsx  # AI summary display
    ├── StatsGrid.jsx    # Stats cards
    ├── RiskTrendCard.jsx     # Composite risk severity chart
    └── EventTimeline.jsx     # Event list
```

## Design System

### Colors
- **Critical**: Red (#dc2626)
- **High**: Orange (#f97316)
- **Medium**: Gold (#eab308)
- **Low**: Green (#16a34a)
- **HR Events**: Violet (#8b5cf6)
- **Finance Events**: Azure (#2563eb)

### Theme
- Light backdrop gradient (#ffffff → #eff3f8)
- Layered glass cards with soft borders (#e5e7eb)
- Animated accents with electric blues and cyans
- Rounded geometry (6px–18px radii) and pill controls
