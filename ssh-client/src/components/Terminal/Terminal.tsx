import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import './Terminal.css'
import { useTerminal } from './useTerminal'

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const { theme, onData, onKey } = useTerminal()

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    // Initialize xterm
    const terminal = new XTerm({
      cursorBlink: theme.cursorBlink,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
      lineHeight: theme.lineHeight,
      theme: {
        background: theme.colors.background,
        foreground: theme.colors.foreground,
        cursor: theme.colors.cursor,
        selection: theme.colors.selection,
        black: theme.colors.black,
        red: theme.colors.red,
        green: theme.colors.green,
        yellow: theme.colors.yellow,
        blue: theme.colors.blue,
        magenta: theme.colors.magenta,
        cyan: theme.colors.cyan,
        white: theme.colors.white,
        brightBlack: theme.colors.brightBlack,
        brightRed: theme.colors.brightRed,
        brightGreen: theme.colors.brightGreen,
        brightYellow: theme.colors.brightYellow,
        brightBlue: theme.colors.brightBlue,
        brightMagenta: theme.colors.brightMagenta,
        brightCyan: theme.colors.brightCyan,
        brightWhite: theme.colors.brightWhite,
      },
      scrollback: 10000,
    })

    // Add fit addon
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    // Open terminal
    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Handle data and key events
    terminal.onData(onData)
    terminal.onKey(onKey)

    // Welcome message
    terminal.writeln('\x1b[1;32mReactive SSH Client v0.1.0\x1b[0m')
    terminal.writeln('\x1b[90mUltra customizable terminal experience\x1b[0m')
    terminal.writeln('')
    terminal.write('\x1b[1;36m$\x1b[0m ')

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [theme, onData, onKey])

  return (
    <div className="terminal-wrapper">
      <div className="terminal" ref={terminalRef} />
    </div>
  )
}

export default Terminal
