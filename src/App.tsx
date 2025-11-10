import { useState, useEffect, useCallback, useRef } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import { Note, Folder } from './types'
import './App.css'

const COLORS = [
  '#1d1d1f', // black
  '#34c759', // green
  '#ff3b30', // red
  '#007aff', // blue
]

const GRID_SIZE = 20
const STORAGE_KEY = 'organizer-notes'
const STORAGE_FOLDERS_KEY = 'organizer-folders'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null) // null = master workflow
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const nextZIndexRef = useRef(1)

  // Carregar notas e pastas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY)
    const savedFolders = localStorage.getItem(STORAGE_FOLDERS_KEY)
    
    if (savedNotes) {
      try {
        const data = JSON.parse(savedNotes)
        setNotes(data.notes || [])
        nextZIndexRef.current = data.nextZIndex || 1
      } catch (e) {
        console.error('Erro ao carregar notas:', e)
      }
    }
    
    if (savedFolders) {
      try {
        const foldersData = JSON.parse(savedFolders)
        setFolders(foldersData || [])
      } catch (e) {
        console.error('Erro ao carregar pastas:', e)
      }
    }
  }, [])

  // Salvar notas no localStorage
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        notes,
        nextZIndex: nextZIndexRef.current
      }))
    }
  }, [notes])

  // Salvar pastas no localStorage
  useEffect(() => {
    if (folders.length > 0 || localStorage.getItem(STORAGE_FOLDERS_KEY)) {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders))
    }
  }, [folders])

  // Filtrar notas baseado na pasta atual
  const currentNotes = notes.filter(note => {
    if (currentFolderId === null) {
      // Master workflow: mostra apenas notas sem pasta
      return !note.folderId
    } else {
      // Pasta específica: mostra apenas notas dessa pasta
      return note.folderId === currentFolderId
    }
  })

  const addNote = useCallback(() => {
    // Se estiver dentro de uma pasta, organiza as notas lado a lado
    let newX: number
    let newY: number
    
    if (currentFolderId !== null) {
      // Organização lado a lado dentro da pasta
      const notesInFolder = currentNotes.length
      const spacing = 20
      const noteWidth = 240
      const startX = 50
      const startY = 100
      newX = startX + (notesInFolder * (noteWidth + spacing))
      newY = startY
    } else {
      // Master workflow: centro da tela
      newX = Math.round((window.innerWidth / 2 - pan.x) / zoom / GRID_SIZE) * GRID_SIZE
      newY = Math.round((window.innerHeight / 2 - pan.y) / zoom / GRID_SIZE) * GRID_SIZE
    }

    const newNote: Note = {
      id: Date.now().toString(),
      x: newX,
      y: newY,
      width: 240,
      height: 240,
      title: '',
      content: '',
      color: selectedColor,
      zIndex: nextZIndexRef.current++,
      folderId: currentFolderId,
    }
    setNotes(prev => [...prev, newNote])
  }, [selectedColor, zoom, pan, currentFolderId, currentNotes])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }, [])

  const bringToFront = useCallback((id: string) => {
    const newZIndex = nextZIndexRef.current++
    updateNote(id, { zIndex: newZIndex })
  }, [updateNote])

  const clearAll = useCallback(() => {
    const message = currentFolderId 
      ? 'Tem certeza que deseja limpar todas as notas desta pasta?'
      : 'Tem certeza que deseja limpar todas as notas?'
    
    if (window.confirm(message)) {
      if (currentFolderId) {
        // Remove apenas notas da pasta atual
        setNotes(prev => prev.filter(note => note.folderId !== currentFolderId))
      } else {
        // Remove apenas notas do master workflow
        setNotes(prev => prev.filter(note => note.folderId !== null && note.folderId !== undefined))
      }
    }
  }, [currentFolderId])

  // Criar pasta
  const createFolder = useCallback(() => {
    const folderName = prompt('Nome da pasta:')
    if (!folderName || folderName.trim() === '') return

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      createdAt: Date.now(),
    }
    setFolders(prev => [...prev, newFolder])
  }, [])

  // Navegar para uma pasta
  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId)
    setSelectedNotes(new Set())
    // Reset pan e zoom ao navegar
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  // Voltar para o master workflow
  const navigateToMaster = useCallback(() => {
    navigateToFolder(null)
  }, [navigateToFolder])

  // Selecionar nota
  const handleNoteSelect = useCallback((noteId: string, shiftKey: boolean) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev)
      if (shiftKey) {
        // Toggle seleção com Shift
        if (newSet.has(noteId)) {
          newSet.delete(noteId)
        } else {
          newSet.add(noteId)
        }
      } else {
        // Seleção única
        newSet.clear()
        newSet.add(noteId)
      }
      return newSet
    })
  }, [])

  // Organizar notas dentro da pasta atual (lado a lado)
  const organizeNotesInFolder = useCallback((folderId: string | null) => {
    if (folderId === null) return

    const spacing = 20
    const noteWidth = 240
    const startX = 50
    const startY = 100

    setNotes(prev => {
      const folderNotes = prev.filter(note => note.folderId === folderId)
      if (folderNotes.length === 0) return prev
      
      // Ordenar por ID para manter ordem consistente
      const sortedNotes = [...folderNotes].sort((a, b) => a.id.localeCompare(b.id))
      
      return prev.map((note) => {
        if (note.folderId === folderId) {
          const index = sortedNotes.findIndex(n => n.id === note.id)
          if (index === -1) return note
          return {
            ...note,
            x: startX + (index * (noteWidth + spacing)),
            y: startY,
          }
        }
        return note
      })
    })
  }, [])

  // Mover notas selecionadas para uma pasta
  const moveSelectedNotesToFolder = useCallback((folderId: string | null) => {
    if (selectedNotes.size === 0) return

    setNotes(prev => prev.map(note => {
      if (selectedNotes.has(note.id)) {
        return { ...note, folderId }
      }
      return note
    }))
    setSelectedNotes(new Set())
    
    // Se moveu para uma pasta, organiza as notas
    if (folderId !== null) {
      setTimeout(() => {
        organizeNotesInFolder(folderId)
      }, 50)
    }
  }, [selectedNotes, organizeNotesInFolder])

  // Organizar automaticamente quando entrar em uma pasta ou quando notas mudam
  useEffect(() => {
    if (currentFolderId !== null) {
      // Pequeno delay para garantir que as notas foram carregadas
      const timeoutId = setTimeout(() => {
        organizeNotesInFolder(currentFolderId)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [currentFolderId, organizeNotesInFolder, currentNotes.length])

  // Obter nome da pasta atual
  const currentFolder = currentFolderId 
    ? folders.find(f => f.id === currentFolderId)
    : null

  return (
    <div className="app">
      <Toolbar
        colors={COLORS}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onAddNote={addNote}
        onClearAll={clearAll}
        zoom={zoom}
        noteCount={currentNotes.length}
        folders={folders}
        currentFolderId={currentFolderId}
        currentFolderName={currentFolder?.name || null}
        onCreateFolder={createFolder}
        onNavigateToFolder={navigateToFolder}
        onNavigateToMaster={navigateToMaster}
        selectedNotesCount={selectedNotes.size}
        onMoveSelectedToFolder={moveSelectedNotesToFolder}
      />
      <Canvas
        notes={currentNotes}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onBringToFront={bringToFront}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        gridSize={GRID_SIZE}
        selectedNotes={selectedNotes}
        onNoteSelect={handleNoteSelect}
      />
    </div>
  )
}

export default App

