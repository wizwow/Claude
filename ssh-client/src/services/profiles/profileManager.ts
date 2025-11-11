import { BehaviorSubject } from 'rxjs'
import { SSHProfile, ProfileSettings } from '@/types'

const DEFAULT_SETTINGS: ProfileSettings = {
  theme: 'Default Dark',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  arrowUpBehavior: 'history',
  arrowDownBehavior: 'history',
  enableAutocomplete: true,
  showSidebar: true,
  sidebarPosition: 'right',
  shortcuts: {
    'ctrl+shift+t': 'newTab',
    'ctrl+shift+w': 'closeTab',
    'ctrl+shift+e': 'openEditor',
    'ctrl+shift+p': 'commandPalette',
    'ctrl+c': 'copy',
    'ctrl+v': 'paste',
  },
}

class ProfileManager {
  private profiles$ = new BehaviorSubject<SSHProfile[]>([])
  private activeProfile$ = new BehaviorSubject<SSHProfile | null>(null)
  private readonly STORAGE_KEY = 'ssh-client-profiles'

  constructor() {
    this.loadProfiles()
  }

  // Get observable for profiles
  getProfiles$() {
    return this.profiles$.asObservable()
  }

  // Get active profile
  getActiveProfile$() {
    return this.activeProfile$.asObservable()
  }

  // Create a new profile
  createProfile(profile: Omit<SSHProfile, 'id'>): string {
    const id = `profile-${Date.now()}`
    const newProfile: SSHProfile = {
      id,
      ...profile,
      customSettings: {
        ...DEFAULT_SETTINGS,
        ...profile.customSettings,
      },
    }

    const currentProfiles = this.profiles$.value
    this.profiles$.next([...currentProfiles, newProfile])
    this.saveProfiles()

    return id
  }

  // Update a profile
  updateProfile(id: string, updates: Partial<SSHProfile>) {
    const currentProfiles = this.profiles$.value
    const updatedProfiles = currentProfiles.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    )
    this.profiles$.next(updatedProfiles)
    this.saveProfiles()
  }

  // Delete a profile
  deleteProfile(id: string) {
    const currentProfiles = this.profiles$.value
    this.profiles$.next(currentProfiles.filter((p) => p.id !== id))
    this.saveProfiles()

    // Clear active profile if it was deleted
    if (this.activeProfile$.value?.id === id) {
      this.activeProfile$.next(null)
    }
  }

  // Set active profile
  setActiveProfile(id: string) {
    const profile = this.profiles$.value.find((p) => p.id === id)
    if (profile) {
      this.activeProfile$.next(profile)
    }
  }

  // Get profile by ID
  getProfile(id: string): SSHProfile | undefined {
    return this.profiles$.value.find((p) => p.id === id)
  }

  // Save profiles to localStorage
  private saveProfiles() {
    try {
      const profiles = this.profiles$.value.map((p) => ({
        ...p,
        // Don't save sensitive data like passwords
        password: undefined,
      }))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error('Failed to save profiles:', error)
    }
  }

  // Load profiles from localStorage
  private loadProfiles() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const profiles = JSON.parse(stored)
        this.profiles$.next(profiles)
      } else {
        // Create a default demo profile
        this.createDemoProfile()
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
      this.createDemoProfile()
    }
  }

  // Create a demo profile for testing
  private createDemoProfile() {
    this.createProfile({
      name: 'Local Server',
      host: 'localhost',
      port: 22,
      username: 'user',
      authMethod: 'password',
      theme: 'Default Dark',
    })
  }
}

// Export singleton instance
export const profileManager = new ProfileManager()
