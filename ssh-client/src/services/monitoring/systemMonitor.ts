import { Subject } from 'rxjs'
import { SystemInfo } from '@/types'

class SystemMonitorService {
  private systemInfo$ = new Subject<SystemInfo>()
  private updateInterval: NodeJS.Timeout | null = null
  private readonly UPDATE_INTERVAL = 2000 // 2 seconds

  constructor() {
    this.startMonitoring()
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
      // Since we can't use systeminformation in the browser,
      // we'll create mock data for now
      // In a real Electron app, this would communicate with the main process

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
        currentPath: this.getCurrentPath(),
        uptime: Math.floor(Math.random() * 100000),
      }

      info.memory.percent = (info.memory.used / info.memory.total) * 100

      this.systemInfo$.next(info)
    } catch (error) {
      console.error('Error updating system info:', error)
    }
  }

  // Get current working directory
  private getCurrentPath(): string {
    // In a real implementation, this would get the path from the SSH session
    return '/home/user'
  }
}

// Export singleton instance
export const systemMonitorService = new SystemMonitorService()
