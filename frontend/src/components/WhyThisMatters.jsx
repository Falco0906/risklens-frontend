import { Info } from 'lucide-react'

function WhyThisMatters() {
  return (
    <section className="why-this-matters">
      <div className="why-this-matters-icon">
        <Info size={20} />
      </div>
      <div className="why-this-matters-content">
        <h3>Why this matters</h3>
        <p>
          Operational failures in HR and Finance often surface days or weeks before supply chain disruptions. 
          RiskLens detects these early signals and shows leadership what could break next.
        </p>
      </div>
    </section>
  )
}

export default WhyThisMatters

