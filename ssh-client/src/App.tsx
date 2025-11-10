import { useState, useEffect } from 'react'
import Terminal from './components/Terminal/Terminal'
import Sidebar from './components/Sidebar/Sidebar'
import EditorOverlay from './components/Editor/EditorOverlay'
import PopupManager from './components/Popup/PopupManager'
import { shortcutManager } from './services/shortcuts/shortcutManager'
import { popupService } from './services/popup/popupService'
import './App.css'

function App() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [sidebarPosition] = useState<'left' | 'right'>('right')

  useEffect(() => {
    // Initialize services
    // shortcutManager is already initialized as a singleton

    // Show welcome message
    setTimeout(() => {
      popupService.info(
        'Welcome!',
        'Reactive SSH Client is ready. Press Ctrl+Shift+E to open the editor.'
      )
    }, 1000)
  }, [])

  return (
    <div className="app">
      {showSidebar && sidebarPosition === 'left' && <Sidebar />}

      <div className="terminal-container">
        <Terminal />
      </div>

      {showSidebar && sidebarPosition === 'right' && <Sidebar />}

      <EditorOverlay />
      <PopupManager />
    </div>
  )
}

export default App
