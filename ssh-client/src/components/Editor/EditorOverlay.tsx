import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { EditorOverlay as EditorOverlayType } from '@/types'
import { editorService } from '@/services/editor/editorService'
import './EditorOverlay.css'

const EditorOverlay = () => {
  const [editors, setEditors] = useState<EditorOverlayType[]>([])

  useEffect(() => {
    const subscription = editorService.getEditors$().subscribe({
      next: (editorsList) => setEditors(editorsList),
      error: (err) => console.error('Editor service error:', err),
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleClose = (id: string) => {
    editorService.closeEditor(id)
  }

  const handleSave = (id: string, content: string) => {
    editorService.saveEditor(id, content)
  }

  const visibleEditors = editors.filter((editor) => editor.isVisible)

  if (visibleEditors.length === 0) return null

  return (
    <div className="editor-overlay-container">
      {visibleEditors.map((editor) => (
        <div
          key={editor.id}
          className="editor-overlay"
          style={{
            left: editor.position.x,
            top: editor.position.y,
            width: editor.size.width,
            height: editor.size.height,
          }}
        >
          <div className="editor-header">
            <span className="editor-title">{editor.filePath}</span>
            <div className="editor-actions">
              <button
                className="editor-btn save"
                onClick={() => handleSave(editor.id, editor.content)}
                title="Save (Ctrl+S)"
              >
                Save
              </button>
              <button
                className="editor-btn close"
                onClick={() => handleClose(editor.id)}
                title="Close (Esc)"
              >
                ×
              </button>
            </div>
          </div>
          <div className="editor-content">
            <Editor
              height="100%"
              language={editor.language}
              value={editor.content}
              onChange={(value) => {
                if (value !== undefined) {
                  editorService.updateContent(editor.id, value)
                }
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default EditorOverlay
