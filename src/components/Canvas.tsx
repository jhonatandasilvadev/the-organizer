import { useRef, useEffect, useCallback, useState } from 'react'
import StickyNote from './StickyNote'
import FolderCard from './FolderCard'
import { Note, Folder } from '../types'
import './Canvas.css'

interface CanvasProps {
  notes: Note[]
  folders?: Folder[]
  currentFolderId?: string | null
  onOpenFolder?: (folderId: string) => void
  onRenameFolder?: (folderId: string, name: string) => void
  onRequestEditFolder?: (folderId: string) => void
  editingFolderId?: string | null
  onMoveSelectedToFolder?: (folderId: string) => void
  onUpdateFolderPosition?: (folderId: string, position: { x: number; y: number }) => void
  previewPositions?: Record<string, { x: number; y: number }>
  onGroupDragStart?: (id: string) => void
  onGroupDrag?: (id: string, position: { x: number; y: number }) => void
  onGroupDragEnd?: (id: string, position: { x: number; y: number }) => void
  onClearSelection?: () => void
  onDeleteFolder?: (folderId: string) => void
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onDeleteNote: (id: string) => void
  onBringToFront: (id: string) => void
  zoom: number
  setZoom: (zoom: number) => void
  pan: { x: number; y: number }
  setPan: (pan: { x: number; y: number }) => void
  gridSize: number
  selectedNotes?: Set<string>
  onNoteSelect?: (id: string, shiftKey: boolean) => void
}

function Canvas({
  notes,
  folders = [],
  currentFolderId = null,
  onOpenFolder,
  onRenameFolder,
  onRequestEditFolder,
  editingFolderId = null,
  onMoveSelectedToFolder,
  onUpdateFolderPosition,
  previewPositions,
  onGroupDragStart,
  onGroupDrag,
  onGroupDragEnd,
  onClearSelection,
  onDeleteFolder,
  onUpdateNote,
  onDeleteNote,
  onBringToFront,
  zoom,
  setZoom,
  pan,
  setPan,
  gridSize,
  selectedNotes = new Set(),
  onNoteSelect,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Zoom com Ctrl + Scroll
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = -e.deltaY * 0.001
        const newZoom = Math.min(Math.max(zoom + delta, 0.25), 3)
        
        // Zoom em direção ao cursor
        const rect = canvasRef.current!.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        const worldX = (mouseX - pan.x) / zoom
        const worldY = (mouseY - pan.y) / zoom
        
        const newPanX = mouseX - worldX * newZoom
        const newPanY = mouseY - worldY * newZoom
        
        setZoom(newZoom)
        setPan({ x: newPanX, y: newPanY })
      }
    },
    [zoom, pan, setZoom, setPan]
  )

  // Pan com Ctrl + Drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey && e.button === 0) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }

    if (e.button === 0) {
      const target = e.target as HTMLElement
      if (target === canvasRef.current || target.classList.contains('grid')) {
        onClearSelection?.()
      }
    }
  }, [pan, onClearSelection])

  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) return
    if (e.ctrlKey) return
    if (e.target === contentRef.current) {
      onClearSelection?.()
    }
  }, [onClearSelection, isPanning])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }, [isPanning, panStart, setPan])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isPanning, handleMouseMove, handleMouseUp])

  // Desenhar grade
  const gridPattern = useCallback(() => {
    const size = gridSize * zoom
    return (
      <svg className="grid" width="100%" height="100%">
        <defs>
          <pattern
            id="grid"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
            x={pan.x % size}
            y={pan.y % size}
          >
            <circle cx={0} cy={0} r={1} fill="var(--grid-dot)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    )
  }, [zoom, pan, gridSize])

  return (
    <div
      ref={canvasRef}
      className={`canvas ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {gridPattern()}
      <div
        ref={contentRef}
        className="canvas-content"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
        onMouseDown={handleBackgroundMouseDown}
      >
        {currentFolderId === null && folders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            isActive={editingFolderId === folder.id}
            isEditing={editingFolderId === folder.id}
            selectedNotesCount={selectedNotes.size}
            onOpen={(id) => onOpenFolder?.(id)}
            onMoveSelected={(id) => onMoveSelectedToFolder?.(id)}
            onRename={(id, name) => onRenameFolder?.(id, name)}
            onRequestEdit={(id) => onRequestEditFolder?.(id)}
            onDelete={() => onDeleteFolder?.(folder.id)}
            onUpdatePosition={(position) => onUpdateFolderPosition?.(folder.id, position)}
            gridSize={gridSize}
            zoom={zoom}
            pan={pan}
            canvasRef={canvasRef}
          />
        ))}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            onBringToFront={onBringToFront}
            gridSize={gridSize}
            isSelected={selectedNotes.has(note.id)}
            onSelect={onNoteSelect}
            smoothMovement={true}
            zoom={zoom}
            pan={pan}
            canvasRef={canvasRef}
            previewPosition={previewPositions?.[note.id] ?? null}
            onGroupDragStart={onGroupDragStart}
            onGroupDrag={onGroupDrag}
            onGroupDragEnd={onGroupDragEnd}
          />
        ))}
      </div>
    </div>
  )
}

export default Canvas

