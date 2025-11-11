import { useState, useEffect } from 'react'
import { PopupConfig } from '@/types'
import { popupService } from '@/services/popup/popupService'
import './PopupManager.css'

const PopupManager = () => {
  const [popups, setPopups] = useState<PopupConfig[]>([])

  useEffect(() => {
    const subscription = popupService.getPopups$().subscribe({
      next: (popupsList) => setPopups(popupsList),
      error: (err) => console.error('Popup service error:', err),
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleClose = (id: string) => {
    popupService.closePopup(id)
  }

  return (
    <div className="popup-container">
      {popups.map((popup) => (
        <div key={popup.id} className={`popup popup-${popup.type}`}>
          <div className="popup-header">
            <span className="popup-title">{popup.title}</span>
            <button
              className="popup-close"
              onClick={() => handleClose(popup.id)}
            >
              ×
            </button>
          </div>
          <div className="popup-content">
            <p>{popup.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PopupManager
