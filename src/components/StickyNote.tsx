import { useState, useRef, useCallback, useEffect } from 'react'
import { Note } from '../types'
import './StickyNote.css'

interface StickyNoteProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Note>) => void
  onDelete: (id: string) => void
  onBringToFront: (id: string) => void
  gridSize: number
}

type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null

function StickyNote({ note, onUpdate, onDelete, onBringToFront, gridSize }: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const noteRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize

  const titleRef = useRef<HTMLInputElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === textareaRef.current || e.target === titleRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    onBringToFront(note.id)
    setIsDragging(true)
    setDragStart({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    })
  }, [note.id, note.x, note.y, onBringToFront])

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault()
    e.stopPropagation()
    
    onBringToFront(note.id)
    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: note.width,
      height: note.height,
    })
  }, [note.id, note.width, note.height, onBringToFront])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = snapToGrid(e.clientX - dragStart.x)
        const newY = snapToGrid(e.clientY - dragStart.y)
        onUpdate(note.id, { x: newX, y: newY })
      } else if (isResizing && resizeHandle) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        let newX = note.x
        let newY = note.y
        let newWidth = resizeStart.width
        let newHeight = resizeStart.height

        if (resizeHandle.includes('e')) {
          newWidth = Math.max(160, resizeStart.width + deltaX)
        }
        if (resizeHandle.includes('w')) {
          const widthDiff = Math.max(160, resizeStart.width - deltaX)
          if (widthDiff >= 160) {
            newWidth = widthDiff
            newX = note.x + (resizeStart.width - widthDiff)
          }
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(160, resizeStart.height + deltaY)
        }
        if (resizeHandle.includes('n')) {
          const heightDiff = Math.max(160, resizeStart.height - deltaY)
          if (heightDiff >= 160) {
            newHeight = heightDiff
            newY = note.y + (resizeStart.height - heightDiff)
          }
        }

        newX = snapToGrid(newX)
        newY = snapToGrid(newY)
        newWidth = snapToGrid(newWidth)
        newHeight = snapToGrid(newHeight)

        onUpdate(note.id, { x: newX, y: newY, width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle(null)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeHandle, note, onUpdate, snapToGrid, gridSize])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(note.id, { title: e.target.value })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(note.id, { content: e.target.value })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const titleText = note.title || 'esta nota'
    const confirmMessage = note.title 
      ? `Tem certeza que deseja excluir "${note.title}"?`
      : 'Tem certeza que deseja excluir esta nota?'
    
    if (window.confirm(confirmMessage)) {
      onDelete(note.id)
    }
  }

  // Detectar se é nota preta para usar texto branco
  const isBlackNote = note.color === '#1d1d1f'
  const textColor = isBlackNote ? 'rgba(255, 255, 255, 0.9)' : 'var(--note-text)'
  const placeholderClass = isBlackNote ? 'note-content black-note' : 'note-content'
  const deleteButtonColor = isBlackNote ? 'rgba(255, 255, 255, 0.15)' : 'var(--note-delete-bg)'
  const deleteIconColor = isBlackNote ? 'rgba(255, 255, 255, 0.7)' : 'var(--note-delete-color)'

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="note-header">
        <input
          ref={titleRef}
          type="text"
          className={isBlackNote ? 'note-title black-note' : 'note-title'}
          style={{ color: textColor }}
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Título..."
          spellCheck={false}
        />
      </div>
      
      {/* Botão flutuante de delete */}
      <button 
        className="delete-btn-floating" 
        onClick={handleDelete}
        title="Excluir nota"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path 
            d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
      
      <textarea
        ref={textareaRef}
        className={placeholderClass}
        style={{ color: textColor }}
        value={note.content}
        onChange={handleContentChange}
        placeholder="Digite aqui..."
        spellCheck={false}
      />

      {/* Resize handles */}
      <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
      <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
      <div className="resize-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
      <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="resize-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
      <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
    </div>
  )
}

export default StickyNote

