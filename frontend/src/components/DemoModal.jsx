import { X } from 'lucide-react'

function DemoModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null

  return (
    <div className="demo-modal-overlay" onClick={onClose}>
      <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="demo-modal-header">
          <h3>{title}</h3>
          <button className="demo-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="demo-modal-content">
          <p>{message}</p>
        </div>
        <div className="demo-modal-footer">
          <button className="demo-modal-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default DemoModal

