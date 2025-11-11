import { Subject } from 'rxjs'
import { SystemInfo } from '@/types'
import { invoke } from '@tauri-apps/api/core'

interface TauriSystemInfo {
  cpu_usage: number
  memory_used: number
  memory_total: number
  memory_percent: number
  uptime: number
}

class SystemMonitorService {
  private systemInfo$ = new Subject<SystemInfo>()
  private updateInterval: NodeJS.Timeout | null = null
  private readonly UPDATE_INTERVAL = 2000 // 2 seconds
  private isTauri: boolean = false

  constructor() {
    this.detectTauri()
    this.startMonitoring()
  }

  // Detect if running in Tauri
  private detectTauri() {
    try {
      this.isTauri = '__TAURI_INTERNALS__' in window
    } catch {
      this.isTauri = false
    }
  }

  // Get observable for system info updates
  getSystemInfo$() {
    return this.systemInfo$.asObservable()
  }

  // Start monitoring
  startMonitoring() {
    if (this.updateInterval) return

    this.updateInterval = setInterval(() => {
      this.updateSystemInfo()
    }, this.UPDATE_INTERVAL)
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  // Update system info
  async updateSystemInfo() {
    try {
      if (this.isTauri) {
        // Use Tauri API for real system info
        const tauriInfo = await invoke<TauriSystemInfo>('get_system_info')
        const currentPath = await invoke<string>('get_current_path')

        const info: SystemInfo = {
          cpu: {
            usage: tauriInfo.cpu_usage,
            temperature: undefined, // Not available from sysinfo
          },
          memory: {
            used: tauriInfo.memory_used,
            total: tauriInfo.memory_total,
            percent: tauriInfo.memory_percent,
          },
          currentPath,
          uptime: tauriInfo.uptime,
        }

        this.systemInfo$.next(info)
      } else {
        // Fallback to mock data for browser
        const info: SystemInfo = {
          cpu: {
            usage: Math.random() * 100,
            temperature: 45 + Math.random() * 30,
          },
          memory: {
            used: 4 * 1024 * 1024 * 1024 + Math.random() * 2 * 1024 * 1024 * 1024,
            total: 16 * 1024 * 1024 * 1024,
            percent: 0,
          },
          currentPath: '/home/user',
          uptime: Math.floor(Math.random() * 100000),
        }

        info.memory.percent = (info.memory.used / info.memory.total) * 100

        this.systemInfo$.next(info)
      }
    } catch (error) {
      console.error('Error updating system info:', error)
    }
  }
}

// Export singleton instance
export const systemMonitorService = new SystemMonitorService()
