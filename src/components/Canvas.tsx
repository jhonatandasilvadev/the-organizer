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
  onTogglePin?: (id: string) => void
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
  onTogglePin,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)

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
    [zoom, pan, setZoom, setPan],
  )

  // Pan com Ctrl + Drag ou Seleção por arraste
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.ctrlKey && e.button === 0) {
        e.preventDefault()
        setIsPanning(true)
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        return
      }

      if (e.button === 0) {
        const target = e.target as HTMLElement
        // Se clicou no canvas vazio (não em uma nota ou pasta), inicia seleção por arraste
        if (
          (target === canvasRef.current ||
            target.classList.contains('grid') ||
            target === contentRef.current) &&
          !target.closest('.sticky-note') &&
          !target.closest('.folder-card')
        ) {
          e.preventDefault()
          const rect = canvasRef.current!.getBoundingClientRect()
          const startX = e.clientX - rect.left
          const startY = e.clientY - rect.top

          // Converter para coordenadas do canvas (considerando zoom e pan)
          const canvasStartX = (startX - pan.x) / zoom
          const canvasStartY = (startY - pan.y) / zoom

          setIsSelecting(true)
          setSelectionBox({
            startX: canvasStartX,
            startY: canvasStartY,
            endX: canvasStartX,
            endY: canvasStartY,
          })

          // Se não estiver com Shift, limpa seleção atual
          if (!e.shiftKey) {
            onClearSelection?.()
          }
        }
      }
    },
    [pan, zoom, onClearSelection],
  )

  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) return
      if (e.ctrlKey) return
      if (e.target === contentRef.current) {
        onClearSelection?.()
      }
    },
    [onClearSelection, isPanning],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      } else if (isSelecting && selectionBox && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const endX = e.clientX - rect.left
        const endY = e.clientY - rect.top

        // Converter para coordenadas do canvas
        const canvasEndX = (endX - pan.x) / zoom
        const canvasEndY = (endY - pan.y) / zoom

        setSelectionBox({
          ...selectionBox,
          endX: canvasEndX,
          endY: canvasEndY,
        })
      }
    },
    [isPanning, panStart, setPan, isSelecting, selectionBox, zoom, pan],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    if (isSelecting && selectionBox) {
      // Detectar notas dentro da seleção final
      const selectionRect = {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        right: Math.max(selectionBox.startX, selectionBox.endX),
        bottom: Math.max(selectionBox.startY, selectionBox.endY),
      }

      // Apenas seleciona se o retângulo tiver tamanho mínimo
      const minSize = 10
      if (
        selectionRect.right - selectionRect.left > minSize &&
        selectionRect.bottom - selectionRect.top > minSize
      ) {
        const notesInSelection = notes.filter((note) => {
          const noteLeft = note.x
          const noteTop = note.y
          const noteRight = note.x + note.width
          const noteBottom = note.y + note.height

          // Verifica se a nota intersecta com o retângulo de seleção
          return (
            noteLeft < selectionRect.right &&
            noteRight > selectionRect.left &&
            noteTop < selectionRect.bottom &&
            noteBottom > selectionRect.top
          )
        })

        // Seleciona as notas encontradas
        if (notesInSelection.length > 0 && onNoteSelect) {
          notesInSelection.forEach((note) => {
            onNoteSelect(note.id, true) // Usa shiftKey=true para adicionar à seleção
          })
        }
      }

      setIsSelecting(false)
      setSelectionBox(null)
    }
  }, [isSelecting, selectionBox, notes, onNoteSelect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    if (isPanning || isSelecting) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isPanning, isSelecting, handleMouseMove, handleMouseUp])

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

  // Calcular dimensões do retângulo de seleção para renderização
  const selectionRect = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        width: Math.abs(selectionBox.endX - selectionBox.startX),
        height: Math.abs(selectionBox.endY - selectionBox.startY),
      }
    : null

  return (
    <div
      ref={canvasRef}
      className={`canvas ${isPanning ? 'panning' : ''} ${isSelecting ? 'selecting' : ''}`}
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
        {/* Retângulo de seleção */}
        {selectionRect && (
          <div
            className="selection-box"
            style={{
              left: selectionRect.left,
              top: selectionRect.top,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
        {currentFolderId === null &&
          folders.map((folder) => (
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
        {notes.map((note) => (
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
            onTogglePin={onTogglePin}
            showPinButton={currentFolderId === null}
          />
        ))}
      </div>
    </div>
  )
}

export default Canvas
