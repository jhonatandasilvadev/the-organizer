import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Folder } from '../types'
import './FolderCard.css'

interface FolderCardProps {
  folder: Folder
  isActive?: boolean
  isEditing?: boolean
  selectedNotesCount?: number
  onOpen: (id: string) => void
  onMoveSelected: (id: string) => void
  onRename: (id: string, name: string) => void
  onRequestEdit: (id: string) => void
  onDelete: (id: string) => void
  onUpdatePosition: (position: { x: number; y: number }) => void
  gridSize: number
  zoom: number
  pan: { x: number; y: number }
  canvasRef?: React.RefObject<HTMLDivElement>
}

function FolderCard({
  folder,
  isActive = false,
  isEditing = false,
  selectedNotesCount = 0,
  onOpen,
  onMoveSelected,
  onRename,
  onRequestEdit,
  onDelete,
  onUpdatePosition,
  gridSize,
  zoom,
  pan,
  canvasRef,
}: FolderCardProps) {
  const [editing, setEditing] = useState(isEditing)
  const [name, setName] = useState(folder.name)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const draggedRef = useRef(false)

  useEffect(() => {
    setName(folder.name)
  }, [folder.name])

  useEffect(() => {
    setEditing(isEditing)
  }, [isEditing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const snapToGrid = useCallback((value: number) => Math.round(value / gridSize) * gridSize, [gridSize])

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (editing) return
    if (event.button !== 0) return

    const target = event.target as HTMLElement
    if (target.closest('.folder-card-rename')) {
      return
    }

    const canvasRect = canvasRef?.current?.getBoundingClientRect()
    if (!canvasRect) return

    event.preventDefault()
    setIsDragging(true)
    draggedRef.current = false

    const mouseCanvasX = (event.clientX - canvasRect.left - pan.x) / zoom
    const mouseCanvasY = (event.clientY - canvasRect.top - pan.y) / zoom

    setDragStart({
      x: mouseCanvasX - folder.x,
      y: mouseCanvasY - folder.y,
    })
    setTempPosition(null)
  }, [editing, canvasRef, pan, zoom, folder.x, folder.y])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (event: MouseEvent) => {
      const canvasRect = canvasRef?.current?.getBoundingClientRect()
      if (!canvasRect) return

      const mouseCanvasX = (event.clientX - canvasRect.left - pan.x) / zoom
      const mouseCanvasY = (event.clientY - canvasRect.top - pan.y) / zoom

      const newX = mouseCanvasX - dragStart.x
      const newY = mouseCanvasY - dragStart.y
      setTempPosition({ x: newX, y: newY })
      draggedRef.current = true
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (tempPosition) {
        const finalX = snapToGrid(tempPosition.x)
        const finalY = snapToGrid(tempPosition.y)
        onUpdatePosition({ x: finalX, y: finalY })
        setTempPosition(null)
      }
      setTimeout(() => {
        draggedRef.current = false
      }, 0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, pan, zoom, snapToGrid, tempPosition, onUpdatePosition, canvasRef])

  const handleClick = () => {
    if (editing) return
    if (draggedRef.current || isDragging || tempPosition) return

    if (selectedNotesCount > 0) {
      onMoveSelected(folder.id)
    } else {
      onOpen(folder.id)
    }
  }

  const handleRenameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onRequestEdit(folder.id)
    setEditing(true)
  }

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const message = `Excluir a pasta "${folder.name}"? As notas serão movidas para o Master Workflow.`
    if (window.confirm(message)) {
      onDelete(folder.id)
    }
  }

  const confirmRename = () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setName(folder.name)
      setEditing(false)
      return
    }
    if (trimmed !== folder.name) {
      onRename(folder.id, trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      confirmRename()
    }
    if (event.key === 'Escape') {
      setName(folder.name)
      setEditing(false)
    }
  }

  const hintLabel = useMemo(() => {
    if (selectedNotesCount === 0) return null
    if (selectedNotesCount === 1) return 'Mover 1 nota'
    return `Mover ${selectedNotesCount} notas`
  }, [selectedNotesCount])

  const displayX = tempPosition?.x ?? folder.x
  const displayY = tempPosition?.y ?? folder.y

  return (
    <div
      className={`folder-card ${isActive ? 'active' : ''} ${selectedNotesCount > 0 ? 'drop-target' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ left: displayX, top: displayY }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="folder-card-body">
        <div className="folder-card-actions">
          <button
            type="button"
            className="folder-card-delete"
            onClick={handleDeleteClick}
            title="Excluir pasta"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M3 4H13M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4M5.5 6.5V11.5M8 6.5V11.5M10.5 6.5V11.5M4 4H12V12C12 12.8284 11.3284 13.5 10.5 13.5H5.5C4.67157 13.5 4 12.8284 4 12V4Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="folder-card-rename"
            onClick={handleRenameClick}
            title="Renomear pasta"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M11.742 2.744a1.5 1.5 0 0 1 2.122 2.122l-7.1 7.1L4 12l.034-2.764 7.708-7.708Z"
                fill="currentColor"
              />
              <path
                d="M3.5 14.5h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0 0 1Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </button>
        </div>
        <div className="folder-card-icon">
          <div className="folder-card-icon-top" />
          <div className="folder-card-icon-body" />
        </div>
        <div className="folder-card-content">
          {editing ? (
            <input
              ref={inputRef}
              className="folder-card-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={handleKeyDown}
              maxLength={30}
            />
          ) : (
            <span className="folder-card-title">{folder.name}</span>
          )}
          {hintLabel && (
            <span className="folder-card-hint">{hintLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default FolderCard
