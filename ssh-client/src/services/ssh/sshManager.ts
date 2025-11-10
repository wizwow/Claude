import { BehaviorSubject } from 'rxjs'
import { SSHConnection, SSHProfile } from '@/types'

class SSHManager {
  private connections$ = new BehaviorSubject<SSHConnection[]>([])
  private activeConnection$ = new BehaviorSubject<SSHConnection | null>(null)

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
      // In a real implementation with Electron, this would use the ssh2 library
      // via IPC to the main process. For now, we'll simulate a connection.

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update status to connected
      this.updateConnectionStatus(id, 'connected')

      // Set as active connection
      this.activeConnection$.next(this.getConnection(id)!)

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

    // Close SSH connection
    // In a real implementation, this would close the ssh2 connection

    // Update status
    this.updateConnectionStatus(id, 'disconnected')

    // If this was the active connection, clear it
    if (this.activeConnection$.value?.id === id) {
      this.activeConnection$.next(null)
    }
  }

  // Send command to SSH session
  async sendCommand(connectionId: string, command: string): Promise<string> {
    const connection = this.getConnection(connectionId)
    if (!connection || connection.status !== 'connected') {
      throw new Error('Not connected')
    }

    // In a real implementation, this would send the command via ssh2
    // For now, simulate a response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Mock response for: ${command}`)
      }, 100)
    })
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
