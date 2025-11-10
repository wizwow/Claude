import { useState, useCallback, useEffect } from 'react'
import { Theme } from '@/types'
import { defaultTheme } from '@/themes/defaultTheme'
import { commandHistoryService } from '@/services/autocomplete/commandHistory'

export const useTerminal = () => {
  const [theme] = useState<Theme>(defaultTheme)
  const [currentLine, setCurrentLine] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)

  // Handle data from terminal
  const onData = useCallback((data: string) => {
    // Handle special keys
    const code = data.charCodeAt(0)

    // Enter key
    if (code === 13) {
      console.log('Command:', currentLine)
      // Add to history
      if (currentLine.trim()) {
        commandHistoryService.addCommand(currentLine, '/home/user')
      }
      setCurrentLine('')
      setCursorPosition(0)
    }
    // Backspace
    else if (code === 127) {
      if (cursorPosition > 0) {
        setCurrentLine(prev =>
          prev.slice(0, cursorPosition - 1) + prev.slice(cursorPosition)
        )
        setCursorPosition(prev => prev - 1)
      }
    }
    // Arrow keys and other control characters
    else if (code === 27) {
      // Escape sequences for arrow keys
      // We'll handle this in onKey
    }
    // Regular character
    else {
      setCurrentLine(prev =>
        prev.slice(0, cursorPosition) + data + prev.slice(cursorPosition)
      )
      setCursorPosition(prev => prev + data.length)
    }
  }, [currentLine, cursorPosition])

  // Handle key events
  const onKey = useCallback((event: { key: string; domEvent: KeyboardEvent }) => {
    const { key, domEvent } = event

    // Arrow up - history previous
    if (domEvent.key === 'ArrowUp') {
      domEvent.preventDefault()
      const prevCommand = commandHistoryService.getPrevious()
      if (prevCommand) {
        setCurrentLine(prevCommand)
        setCursorPosition(prevCommand.length)
      }
    }
    // Arrow down - history next
    else if (domEvent.key === 'ArrowDown') {
      domEvent.preventDefault()
      const nextCommand = commandHistoryService.getNext()
      if (nextCommand !== null) {
        setCurrentLine(nextCommand)
        setCursorPosition(nextCommand.length)
      } else {
        setCurrentLine('')
        setCursorPosition(0)
      }
    }
    // Arrow left - move cursor left
    else if (domEvent.key === 'ArrowLeft') {
      domEvent.preventDefault()
      setCursorPosition(prev => Math.max(0, prev - 1))
    }
    // Arrow right - move cursor right
    else if (domEvent.key === 'ArrowRight') {
      domEvent.preventDefault()
      setCursorPosition(prev => Math.min(currentLine.length, prev + 1))
    }
    // Tab - autocomplete
    else if (domEvent.key === 'Tab') {
      domEvent.preventDefault()
      const suggestions = commandHistoryService.getSuggestions(currentLine)
      if (suggestions.length > 0) {
        setCurrentLine(suggestions[0])
        setCursorPosition(suggestions[0].length)
      }
    }
  }, [currentLine])

  return {
    theme,
    onData,
    onKey,
  }
}
