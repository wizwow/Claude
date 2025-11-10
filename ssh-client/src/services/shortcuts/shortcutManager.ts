import { profileManager } from '../profiles/profileManager'
import { editorService } from '../editor/editorService'
import { popupService } from '../popup/popupService'

class ShortcutManager {
  private shortcuts: Map<string, () => void> = new Map()

  constructor() {
    this.registerDefaultShortcuts()
    this.setupEventListener()
  }

  // Register a shortcut
  register(key: string, handler: () => void) {
    this.shortcuts.set(key.toLowerCase(), handler)
  }

  // Unregister a shortcut
  unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase())
  }

  // Handle keyboard event
  private handleKeyDown = (event: KeyboardEvent) => {
    const key = this.getKeyString(event)
    const handler = this.shortcuts.get(key)

    if (handler) {
      event.preventDefault()
      handler()
    }
  }

  // Convert keyboard event to key string
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = []

    if (event.ctrlKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    if (event.metaKey) parts.push('meta')

    const key = event.key.toLowerCase()
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      parts.push(key)
    }

    return parts.join('+')
  }

  // Setup event listener
  private setupEventListener() {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  // Register default shortcuts
  private registerDefaultShortcuts() {
    // New tab (placeholder for future implementation)
    this.register('ctrl+shift+t', () => {
      popupService.info('Shortcut', 'New tab (coming soon)')
    })

    // Close tab (placeholder)
    this.register('ctrl+shift+w', () => {
      popupService.info('Shortcut', 'Close tab (coming soon)')
    })

    // Open editor
    this.register('ctrl+shift+e', () => {
      editorService.openEditor(
        '/tmp/example.txt',
        '// Example file\n// Press Ctrl+S to save\n',
        'javascript'
      )
      popupService.info('Editor', 'Opened example editor')
    })

    // Command palette (placeholder)
    this.register('ctrl+shift+p', () => {
      popupService.info('Command Palette', 'Opening command palette (coming soon)')
    })

    // Toggle sidebar
    this.register('ctrl+shift+b', () => {
      popupService.info('Sidebar', 'Toggle sidebar (coming soon)')
    })

    // Settings
    this.register('ctrl+,', () => {
      popupService.info('Settings', 'Opening settings (coming soon)')
    })

    // Test popup notifications
    this.register('ctrl+shift+n', () => {
      popupService.info('Test', 'This is a test notification')
    })

    this.register('ctrl+shift+m', () => {
      popupService.warning('Warning', 'This is a warning notification')
    })
  }

  // Load shortcuts from profile
  loadProfileShortcuts(profileId: string) {
    const profile = profileManager.getProfile(profileId)
    if (profile?.customSettings?.shortcuts) {
      // Clear existing custom shortcuts
      // (keep default ones)

      // Register profile shortcuts
      Object.entries(profile.customSettings.shortcuts).forEach(([key, action]) => {
        // Map action names to handlers
        // This is a simplified version
        this.register(key, () => {
          popupService.info('Shortcut', `Action: ${action}`)
        })
      })
    }
  }
}

// Export singleton instance
export const shortcutManager = new ShortcutManager()
