import { useState, useEffect } from 'react'
import { SystemInfo } from '@/types'
import { systemMonitorService } from '@/services/monitoring/systemMonitor'
import './Sidebar.css'

const Sidebar = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpu: { usage: 0, temperature: undefined },
    memory: { used: 0, total: 0, percent: 0 },
    currentPath: '/home/user',
    uptime: 0,
  })

  useEffect(() => {
    // Subscribe to system info updates
    const subscription = systemMonitorService.getSystemInfo$().subscribe({
      next: (info) => setSystemInfo(info),
      error: (err) => console.error('System monitor error:', err),
    })

    // Initial update
    systemMonitorService.updateSystemInfo()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number): string => {
    const gb = (bytes / 1024 / 1024 / 1024).toFixed(2)
    return `${gb} GB`
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Sistema</h3>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-item">
          <span className="sidebar-label">Path Corrente</span>
          <span className="sidebar-value path" title={systemInfo.currentPath}>
            {systemInfo.currentPath}
          </span>
        </div>
      </div>

      <div className="sidebar-section">
        <h4>CPU</h4>
        <div className="sidebar-item">
          <span className="sidebar-label">Utilizzo</span>
          <span className="sidebar-value">{systemInfo.cpu.usage.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill cpu"
            style={{ width: `${systemInfo.cpu.usage}%` }}
          />
        </div>
        {systemInfo.cpu.temperature !== undefined && (
          <div className="sidebar-item">
            <span className="sidebar-label">Temperatura</span>
            <span className="sidebar-value">{systemInfo.cpu.temperature}°C</span>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h4>Memoria</h4>
        <div className="sidebar-item">
          <span className="sidebar-label">Utilizzata</span>
          <span className="sidebar-value">
            {formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill memory"
            style={{ width: `${systemInfo.memory.percent}%` }}
          />
        </div>
        <div className="sidebar-item">
          <span className="sidebar-label">Percentuale</span>
          <span className="sidebar-value">{systemInfo.memory.percent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-item">
          <span className="sidebar-label">Uptime</span>
          <span className="sidebar-value">{formatUptime(systemInfo.uptime)}</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
