import { CommandHistory } from '@/types'

class CommandHistoryService {
  private history: CommandHistory[] = []
  private currentIndex: number = -1
  private maxHistory: number = 1000

  constructor() {
    this.loadHistory()
  }

  // Add command to history
  addCommand(command: string, cwd: string) {
    const entry: CommandHistory = {
      command,
      timestamp: Date.now(),
      cwd,
    }

    this.history.push(entry)

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    this.currentIndex = this.history.length
    this.saveHistory()
  }

  // Get previous command in history
  getPrevious(): string | null {
    if (this.history.length === 0) return null

    if (this.currentIndex > 0) {
      this.currentIndex--
    }

    return this.history[this.currentIndex]?.command || null
  }

  // Get next command in history
  getNext(): string | null {
    if (this.history.length === 0) return null

    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex]?.command || null
    } else {
      this.currentIndex = this.history.length
      return null
    }
  }

  // Reset history navigation
  resetNavigation() {
    this.currentIndex = this.history.length
  }

  // Get command suggestions based on partial input
  getSuggestions(partial: string): string[] {
    if (!partial.trim()) return []

    const suggestions = new Set<string>()

    // Get unique commands that start with the partial input
    for (let i = this.history.length - 1; i >= 0; i--) {
      const cmd = this.history[i].command
      if (cmd.startsWith(partial) && cmd !== partial) {
        suggestions.add(cmd)
      }

      // Limit suggestions
      if (suggestions.size >= 10) break
    }

    return Array.from(suggestions)
  }

  // Get all history
  getAll(): CommandHistory[] {
    return [...this.history]
  }

  // Clear history
  clear() {
    this.history = []
    this.currentIndex = -1
    this.saveHistory()
  }

  // Save history to localStorage
  private saveHistory() {
    try {
      localStorage.setItem('ssh-client-history', JSON.stringify(this.history))
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  // Load history from localStorage
  private loadHistory() {
    try {
      const stored = localStorage.getItem('ssh-client-history')
      if (stored) {
        this.history = JSON.parse(stored)
        this.currentIndex = this.history.length
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }
}

// Export singleton instance
export const commandHistoryService = new CommandHistoryService()
