import { BehaviorSubject } from 'rxjs'
import { SSHConnection, SSHProfile } from '@/types'
import { invoke } from '@tauri-apps/api/core'

interface SSHResponse {
  success: boolean
  message: string
  data?: string
}

class SSHManager {
  private connections$ = new BehaviorSubject<SSHConnection[]>([])
  private activeConnection$ = new BehaviorSubject<SSHConnection | null>(null)
  private isTauri: boolean = false

  constructor() {
    this.detectTauri()
  }

  // Detect if running in Tauri
  private detectTauri() {
    try {
      this.isTauri = '__TAURI_INTERNALS__' in window
    } catch {
      this.isTauri = false
    }
  }

  // Get observable for connections
  getConnections$() {
    return this.connections$.asObservable()
  }

  // Get active connection
  getActiveConnection$() {
    return this.activeConnection$.asObservable()
  }

  // Connect to SSH server
  async connect(profile: SSHProfile): Promise<string> {
    const id = `conn-${Date.now()}`

    const connection: SSHConnection = {
      id,
      profile,
      status: 'connecting',
    }

    // Add to connections list
    const currentConnections = this.connections$.value
    this.connections$.next([...currentConnections, connection])

    try {
      if (this.isTauri) {
        // Use Tauri API for real SSH connection
        const response = await invoke<SSHResponse>('ssh_connect', {
          config: {
            host: profile.host,
            port: profile.port,
            username: profile.username,
            password: profile.password,
            private_key_path: profile.privateKeyPath,
          },
        })

        if (response.success) {
          this.updateConnectionStatus(id, 'connected')
          this.activeConnection$.next(this.getConnection(id)!)
        } else {
          throw new Error(response.message)
        }
      } else {
        // Fallback to mock for browser
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.updateConnectionStatus(id, 'connected')
        this.activeConnection$.next(this.getConnection(id)!)
      }

      return id
    } catch (error) {
      this.updateConnectionStatus(id, 'error', (error as Error).message)
      throw error
    }
  }

  // Disconnect from SSH server
  async disconnect(id: string) {
    const connection = this.getConnection(id)
    if (!connection) return

    try {
      if (this.isTauri) {
        await invoke('ssh_disconnect')
      }

      this.updateConnectionStatus(id, 'disconnected')

      if (this.activeConnection$.value?.id === id) {
        this.activeConnection$.next(null)
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  // Send command to SSH session
  async sendCommand(connectionId: string, command: string): Promise<string> {
    const connection = this.getConnection(connectionId)
    if (!connection || connection.status !== 'connected') {
      throw new Error('Not connected')
    }

    try {
      if (this.isTauri) {
        const response = await invoke<SSHResponse>('ssh_execute', { command })
        return response.data || ''
      } else {
        // Mock response for browser
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(`Mock response for: ${command}`)
          }, 100)
        })
      }
    } catch (error) {
      throw new Error(`Command execution failed: ${(error as Error).message}`)
    }
  }

  // Get connection by ID
  private getConnection(id: string): SSHConnection | undefined {
    return this.connections$.value.find((c) => c.id === id)
  }

  // Update connection status
  private updateConnectionStatus(
    id: string,
    status: SSHConnection['status'],
    error?: string
  ) {
    const currentConnections = this.connections$.value
    const updatedConnections = currentConnections.map((c) =>
      c.id === id ? { ...c, status, error } : c
    )
    this.connections$.next(updatedConnections)
  }
}

// Export singleton instance
export const sshManager = new SSHManager()
