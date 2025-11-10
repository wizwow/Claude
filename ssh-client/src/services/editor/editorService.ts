import { BehaviorSubject } from 'rxjs'
import { EditorOverlay } from '@/types'

class EditorService {
  private editors$ = new BehaviorSubject<EditorOverlay[]>([])

  // Get observable for editors
  getEditors$() {
    return this.editors$.asObservable()
  }

  // Open a new editor
  openEditor(filePath: string, content: string, language: string) {
    const id = `editor-${Date.now()}`
    const newEditor: EditorOverlay = {
      id,
      filePath,
      content,
      language,
      isVisible: true,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
    }

    const currentEditors = this.editors$.value
    this.editors$.next([...currentEditors, newEditor])

    return id
  }

  // Close an editor
  closeEditor(id: string) {
    const currentEditors = this.editors$.value
    this.editors$.next(currentEditors.filter((e) => e.id !== id))
  }

  // Update editor content
  updateContent(id: string, content: string) {
    const currentEditors = this.editors$.value
    const updatedEditors = currentEditors.map((e) =>
      e.id === id ? { ...e, content } : e
    )
    this.editors$.next(updatedEditors)
  }

  // Save editor
  saveEditor(id: string, content: string) {
    console.log('Saving editor:', id, content)
    // In a real implementation, this would save to the SSH server
    // For now, just update content
    this.updateContent(id, content)

    // Show a save notification
    alert('File saved successfully!')
  }

  // Toggle editor visibility
  toggleVisibility(id: string) {
    const currentEditors = this.editors$.value
    const updatedEditors = currentEditors.map((e) =>
      e.id === id ? { ...e, isVisible: !e.isVisible } : e
    )
    this.editors$.next(updatedEditors)
  }
}

// Export singleton instance
export const editorService = new EditorService()
