import { BehaviorSubject } from 'rxjs'
import { PopupConfig } from '@/types'

class PopupService {
  private popups$ = new BehaviorSubject<PopupConfig[]>([])
  private defaultDuration = 5000 // 5 seconds

  // Get observable for popups
  getPopups$() {
    return this.popups$.asObservable()
  }

  // Show a popup
  showPopup(config: Omit<PopupConfig, 'id'>) {
    const id = `popup-${Date.now()}`
    const popup: PopupConfig = {
      id,
      ...config,
      duration: config.duration ?? this.defaultDuration,
    }

    const currentPopups = this.popups$.value
    this.popups$.next([...currentPopups, popup])

    // Auto-close after duration
    if (popup.duration && popup.duration > 0) {
      setTimeout(() => {
        this.closePopup(id)
      }, popup.duration)
    }

    return id
  }

  // Close a popup
  closePopup(id: string) {
    const currentPopups = this.popups$.value
    const popup = currentPopups.find((p) => p.id === id)

    if (popup?.onClose) {
      popup.onClose()
    }

    this.popups$.next(currentPopups.filter((p) => p.id !== id))
  }

  // Convenience methods
  info(title: string, message: string, duration?: number) {
    return this.showPopup({ type: 'info', title, message, duration })
  }

  warning(title: string, message: string, duration?: number) {
    return this.showPopup({ type: 'warning', title, message, duration })
  }

  error(title: string, message: string, duration?: number) {
    return this.showPopup({ type: 'error', title, message, duration: duration ?? 10000 })
  }

  custom(title: string, message: string, duration?: number) {
    return this.showPopup({ type: 'custom', title, message, duration })
  }
}

// Export singleton instance
export const popupService = new PopupService()
