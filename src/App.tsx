import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import { Note, Folder } from './types'
import { computeFolderPosition, generateFolderName } from './utils/folderUtils'
import { GRID_SIZE, snapToGrid as snapToGridUtil } from './utils/gridUtils'
import { isStoredNotesPayload, isStoredFoldersPayload } from './utils/storageUtils'
import { HistoryManager } from './utils/historyUtils'
import './App.css'

const COLORS = [
  '#1d1d1f', // black
  '#34c759', // green
  '#ff3b30', // red
  '#007aff', // blue
]

const STORAGE_KEY = 'organizer-notes'
const STORAGE_FOLDERS_KEY = 'organizer-folders'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null) // null = master workflow
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [previewPositions, setPreviewPositions] = useState<
    Record<string, { x: number; y: number }>
  >({})
  const dragGroupRef = useRef<{
    anchorId: string | null
    originals: Record<string, { x: number; y: number }>
  }>({ anchorId: null, originals: {} })
  const nextZIndexRef = useRef(1)
  const historyManagerRef = useRef(new HistoryManager())
  const isHistoryActionRef = useRef(false)
  const snapToGrid = useCallback((value: number) => snapToGridUtil(value, GRID_SIZE), [])

  // Carregar notas e pastas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY)
    const savedFolders = localStorage.getItem(STORAGE_FOLDERS_KEY)

    if (savedNotes) {
      try {
        const parsedNotes: unknown = JSON.parse(savedNotes)
        if (isStoredNotesPayload(parsedNotes)) {
          if (parsedNotes.notes) {
            setNotes(parsedNotes.notes)
          }
          if (typeof parsedNotes.nextZIndex === 'number') {
            nextZIndexRef.current = parsedNotes.nextZIndex
          }
        }
      } catch (e) {
        console.error('Erro ao carregar notas:', e)
      }
    }

    if (savedFolders) {
      try {
        const parsedFolders: unknown = JSON.parse(savedFolders)
        if (isStoredFoldersPayload(parsedFolders)) {
          const normalized = parsedFolders.map((folder, index) => {
            const position = computeFolderPosition(index)
            return {
              ...folder,
              x: typeof folder.x === 'number' ? folder.x : position.x,
              y: typeof folder.y === 'number' ? folder.y : position.y,
            }
          })
          setFolders(normalized)
        }
      } catch (e) {
        console.error('Erro ao carregar pastas:', e)
      }
    }
  }, [])

  // Salvar estado no histórico (com debounce para evitar muitos estados)
  const isInitialLoadRef = useRef(true)
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Ignora durante carregamento inicial
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      // Inicializa histórico com estado atual após carregamento
      setTimeout(() => {
        isHistoryActionRef.current = true
        historyManagerRef.current.initialize({
          notes,
          folders,
          nextZIndex: nextZIndexRef.current,
        })
        isHistoryActionRef.current = false
      }, 200)
      return
    }

    // Ignora durante ações de undo/redo
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false
      return
    }

    // Debounce: adiciona ao histórico após 500ms de inatividade
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current)
    }

    historyTimeoutRef.current = setTimeout(() => {
      historyManagerRef.current.push({
        notes,
        folders,
        nextZIndex: nextZIndexRef.current,
      })
    }, 500)

    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current)
      }
    }
  }, [notes, folders])

  // Salvar notas no localStorage
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          notes,
          nextZIndex: nextZIndexRef.current,
        }),
      )
    }
  }, [notes])

  // Salvar pastas no localStorage
  useEffect(() => {
    if (folders.length > 0 || localStorage.getItem(STORAGE_FOLDERS_KEY)) {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders))
    }
  }, [folders])

  // Obter todas as tags únicas das notas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Filtrar e ordenar notas baseado na pasta atual, busca, tag e pin
  const currentNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Filtro por pasta
        const folderMatch =
          currentFolderId === null ? !note.folderId : note.folderId === currentFolderId

        if (!folderMatch) return false

        // Filtro por tag selecionada
        if (selectedTag) {
          const hasTag = note.tags?.includes(selectedTag) ?? false
          if (!hasTag) return false
        }

        // Filtro por busca (se houver query)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim()
          const titleMatch = note.title.toLowerCase().includes(query)
          const contentMatch = note.content.toLowerCase().includes(query)
          const tagsMatch = note.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false
          return titleMatch || contentMatch || tagsMatch
        }

        return true
      })
      .sort((a, b) => {
        // No Master Workflow, ordenar por pin primeiro
        if (currentFolderId === null) {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
        }
        // Depois por zIndex (mais recente primeiro)
        return b.zIndex - a.zIndex
      })
  }, [notes, currentFolderId, selectedTag, searchQuery])

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
      newX = startX + notesInFolder * (noteWidth + spacing)
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
    setNotes((prev) => [...prev, newNote])
  }, [selectedColor, zoom, pan, currentFolderId, currentNotes])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }, [])

  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          return { ...note, isPinned: !note.isPinned }
        }
        return note
      }),
    )
  }, [])

  const addTag = useCallback((id: string, tag: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          const currentTags = note.tags || []
          if (!currentTags.includes(tag)) {
            return { ...note, tags: [...currentTags, tag] }
          }
        }
        return note
      }),
    )
  }, [])

  const removeTag = useCallback((id: string, tag: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          const currentTags = note.tags || []
          return { ...note, tags: currentTags.filter((t) => t !== tag) }
        }
        return note
      }),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const bringToFront = useCallback(
    (id: string) => {
      const newZIndex = nextZIndexRef.current++
      updateNote(id, { zIndex: newZIndex })
    },
    [updateNote],
  )

  const clearAll = useCallback(() => {
    const message = currentFolderId
      ? 'Tem certeza que deseja limpar todas as notas desta pasta?'
      : 'Tem certeza que deseja limpar todas as notas?'

    if (window.confirm(message)) {
      if (currentFolderId) {
        // Remove apenas notas da pasta atual
        setNotes((prev) => prev.filter((note) => note.folderId !== currentFolderId))
      } else {
        // Remove apenas notas do master workflow
        setNotes((prev) =>
          prev.filter((note) => note.folderId !== null && note.folderId !== undefined),
        )
      }
    }
  }, [currentFolderId])

  // Criar pasta
  const createFolder = useCallback(() => {
    if (currentFolderId !== null) {
      return
    }

    const newFolderId = `folder-${Date.now()}`
    setFolders((prev) => {
      const position = computeFolderPosition(prev.length)
      const newFolder: Folder = {
        id: newFolderId,
        name: generateFolderName(prev),
        createdAt: Date.now(),
        x: position.x,
        y: position.y,
      }
      return [...prev, newFolder]
    })
    setEditingFolderId(newFolderId)
  }, [currentFolderId])

  const renameFolder = useCallback((folderId: string, name: string) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === folderId ? { ...folder, name } : folder)),
    )
    setEditingFolderId(null)
  }, [])

  const requestEditFolder = useCallback((folderId: string) => {
    setEditingFolderId(folderId)
  }, [])

  const updateFolderPosition = useCallback(
    (folderId: string, position: { x: number; y: number }) => {
      setFolders((prev) =>
        prev.map((folder) => (folder.id === folderId ? { ...folder, ...position } : folder)),
      )
    },
    [],
  )

  const deleteFolder = useCallback(
    (folderId: string) => {
      const affectedNotes = notes
        .filter((note) => note.folderId === folderId)
        .map((note) => note.id)

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId))

      if (affectedNotes.length > 0) {
        setNotes((prev) =>
          prev.map((note) =>
            affectedNotes.includes(note.id) ? { ...note, folderId: null } : note,
          ),
        )

        setSelectedNotes((prev) => {
          if (prev.size === 0) return prev
          const next = new Set(prev)
          let changed = false
          affectedNotes.forEach((id) => {
            if (next.delete(id)) {
              changed = true
            }
          })
          return changed ? next : prev
        })

        setPreviewPositions((prev) => {
          if (!prev || Object.keys(prev).length === 0) return prev
          const next = { ...prev }
          let changed = false
          affectedNotes.forEach((id) => {
            if (next[id]) {
              delete next[id]
              changed = true
            }
          })
          return changed ? next : prev
        })
      }

      if (editingFolderId === folderId) {
        setEditingFolderId(null)
      }

      if (currentFolderId === folderId) {
        setCurrentFolderId(null)
        setPan({ x: 0, y: 0 })
        setZoom(1)
      }
    },
    [notes, currentFolderId, editingFolderId],
  )

  // Navegar para uma pasta
  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId)
    setSelectedNotes(new Set())
    setEditingFolderId(null)
    setSelectedTag(null) // Limpa filtro de tag ao navegar
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
    setSelectedNotes((prev) => {
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

  const clearSelection = useCallback(() => {
    setSelectedNotes(new Set())
    setPreviewPositions({})
    dragGroupRef.current = { anchorId: null, originals: {} }
  }, [])

  const beginGroupDrag = useCallback(
    (noteId: string) => {
      const activeIds =
        selectedNotes.size > 0 && selectedNotes.has(noteId) ? Array.from(selectedNotes) : [noteId]

      const originals: Record<string, { x: number; y: number }> = {}
      for (const id of activeIds) {
        const note = notes.find((n) => n.id === id)
        if (note) {
          originals[id] = { x: note.x, y: note.y }
        }
      }

      dragGroupRef.current = {
        anchorId: noteId,
        originals,
      }
      setPreviewPositions({})
    },
    [notes, selectedNotes],
  )

  const handleGroupDrag = useCallback((noteId: string, position: { x: number; y: number }) => {
    const { anchorId, originals } = dragGroupRef.current
    if (!originals[noteId]) return
    if (anchorId !== noteId) return

    const anchorOriginal = originals[anchorId]
    if (!anchorOriginal) return

    const deltaX = position.x - anchorOriginal.x
    const deltaY = position.y - anchorOriginal.y

    const preview: Record<string, { x: number; y: number }> = {}
    Object.entries(originals).forEach(([id, origin]) => {
      preview[id] = {
        x: origin.x + deltaX,
        y: origin.y + deltaY,
      }
    })
    setPreviewPositions(preview)
  }, [])

  const endGroupDrag = useCallback(
    (noteId: string, position: { x: number; y: number }) => {
      const { anchorId, originals } = dragGroupRef.current
      if (!originals[noteId]) {
        updateNote(noteId, { x: position.x, y: position.y })
        return
      }

      const referenceId = anchorId ?? noteId
      const referenceOriginal = originals[referenceId]
      const deltaX = position.x - (referenceOriginal?.x ?? position.x)
      const deltaY = position.y - (referenceOriginal?.y ?? position.y)

      setNotes((prev) =>
        prev.map((note) => {
          const origin = originals[note.id]
          if (origin) {
            return {
              ...note,
              x: snapToGrid(origin.x + deltaX),
              y: snapToGrid(origin.y + deltaY),
            }
          }
          return note
        }),
      )

      setPreviewPositions({})
      dragGroupRef.current = { anchorId: null, originals: {} }
    },
    [snapToGrid, updateNote],
  )

  // Organizar notas dentro da pasta atual (lado a lado)
  const organizeNotesInFolder = useCallback((folderId: string | null) => {
    if (folderId === null) return

    const spacing = 20
    const noteWidth = 240
    const startX = 50
    const startY = 100

    setNotes((prev) => {
      const folderNotes = prev.filter((note) => note.folderId === folderId)
      if (folderNotes.length === 0) return prev

      // Ordenar por ID para manter ordem consistente
      const sortedNotes = [...folderNotes].sort((a, b) => a.id.localeCompare(b.id))

      return prev.map((note) => {
        if (note.folderId === folderId) {
          const index = sortedNotes.findIndex((n) => n.id === note.id)
          if (index === -1) return note
          return {
            ...note,
            x: startX + index * (noteWidth + spacing),
            y: startY,
          }
        }
        return note
      })
    })
  }, [])

  // Mover notas selecionadas para uma pasta
  const moveSelectedNotesToFolder = useCallback(
    (folderId: string | null) => {
      if (selectedNotes.size === 0) return

      setNotes((prev) =>
        prev.map((note) => {
          if (selectedNotes.has(note.id)) {
            return { ...note, folderId }
          }
          return note
        }),
      )
      setSelectedNotes(new Set())

      // Se moveu para uma pasta, organiza as notas
      if (folderId !== null) {
        setTimeout(() => {
          organizeNotesInFolder(folderId)
        }, 50)
      }
    },
    [selectedNotes, organizeNotesInFolder],
  )

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

  // Exportar dados
  const handleExport = useCallback(() => {
    const data = {
      notes,
      folders,
      nextZIndex: nextZIndexRef.current,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `the-organizer-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [notes, folders])

  // Importar dados
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          const data = JSON.parse(text)

          if (
            !data.notes ||
            !Array.isArray(data.notes) ||
            !data.folders ||
            !Array.isArray(data.folders)
          ) {
            alert('Arquivo inválido. O arquivo deve conter notas e pastas.')
            return
          }

          const confirmMessage = `Importar ${data.notes.length} nota(s) e ${data.folders.length} pasta(s)?\n\nIsso irá substituir todos os dados atuais.`
          if (!window.confirm(confirmMessage)) return

          isHistoryActionRef.current = true
          setNotes(data.notes || [])
          setFolders(data.folders || [])
          if (typeof data.nextZIndex === 'number') {
            nextZIndexRef.current = data.nextZIndex
          }
          setCurrentFolderId(null)
          setSelectedNotes(new Set())
          setSearchQuery('')
          setPan({ x: 0, y: 0 })
          setZoom(1)
          historyManagerRef.current.initialize({
            notes: data.notes || [],
            folders: data.folders || [],
            nextZIndex: data.nextZIndex || 1,
          })

          alert('Dados importados com sucesso!')
        } catch (error) {
          console.error('Erro ao importar:', error)
          alert('Erro ao importar arquivo. Verifique se o arquivo é válido.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  // Undo/Redo
  const handleUndo = useCallback(() => {
    const state = historyManagerRef.current.undo()
    if (state) {
      isHistoryActionRef.current = true
      setNotes(state.notes as Note[])
      setFolders(state.folders as Folder[])
      nextZIndexRef.current = state.nextZIndex
      // Atualiza estado do histórico imediatamente
      setTimeout(() => {
        setHistoryState({
          canUndo: historyManagerRef.current.canUndo(),
          canRedo: historyManagerRef.current.canRedo(),
        })
      }, 0)
    }
  }, [])

  const handleRedo = useCallback(() => {
    const state = historyManagerRef.current.redo()
    if (state) {
      isHistoryActionRef.current = true
      setNotes(state.notes as Note[])
      setFolders(state.folders as Folder[])
      nextZIndexRef.current = state.nextZIndex
      // Atualiza estado do histórico imediatamente
      setTimeout(() => {
        setHistoryState({
          canUndo: historyManagerRef.current.canUndo(),
          canRedo: historyManagerRef.current.canRedo(),
        })
      }, 0)
    }
  }, [])

  // Atalhos de teclado para Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (historyManagerRef.current.canUndo()) {
          handleUndo()
        }
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        if (historyManagerRef.current.canRedo()) {
          handleRedo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  // Estado para forçar re-render quando histórico mudar
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })

  // Atualiza estado do histórico periodicamente (para refletir mudanças após debounce)
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoryState({
        canUndo: historyManagerRef.current.canUndo(),
        canRedo: historyManagerRef.current.canRedo(),
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // Obter nome da pasta atual
  const currentFolder = currentFolderId ? folders.find((f) => f.id === currentFolderId) : null

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
        onMoveSelectedToMaster={() => moveSelectedNotesToFolder(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        onImport={handleImport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        allTags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />
      <Canvas
        notes={currentNotes}
        folders={folders}
        currentFolderId={currentFolderId}
        onOpenFolder={(folderId) => navigateToFolder(folderId)}
        onRenameFolder={renameFolder}
        onRequestEditFolder={requestEditFolder}
        editingFolderId={editingFolderId}
        onMoveSelectedToFolder={(folderId) => moveSelectedNotesToFolder(folderId)}
        onUpdateFolderPosition={updateFolderPosition}
        previewPositions={previewPositions}
        onGroupDragStart={beginGroupDrag}
        onGroupDrag={handleGroupDrag}
        onGroupDragEnd={endGroupDrag}
        onClearSelection={clearSelection}
        onDeleteFolder={deleteFolder}
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
        onTogglePin={togglePin}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
    </div>
  )
}

export default App
