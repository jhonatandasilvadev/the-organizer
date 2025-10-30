import { useState, useEffect, useCallback, useRef } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import { Note } from './types'
import './App.css'

const COLORS = [
  '#1d1d1f', // black
  '#34c759', // green
  '#ff3b30', // red
  '#007aff', // blue
]

const GRID_SIZE = 20
const STORAGE_KEY = 'organizer-notes'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const nextZIndexRef = useRef(1)

  // Carregar notas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setNotes(data.notes || [])
        nextZIndexRef.current = data.nextZIndex || 1
      } catch (e) {
        console.error('Erro ao carregar notas:', e)
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

  const addNote = useCallback(() => {
    const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom / GRID_SIZE) * GRID_SIZE
    const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom / GRID_SIZE) * GRID_SIZE

    const newNote: Note = {
      id: Date.now().toString(),
      x: centerX,
      y: centerY,
      width: 240,
      height: 240,
      title: '',
      content: '',
      color: selectedColor,
      zIndex: nextZIndexRef.current++,
    }
    setNotes(prev => [...prev, newNote])
  }, [selectedColor, zoom, pan])

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
    if (window.confirm('Tem certeza que deseja limpar todas as notas?')) {
      setNotes([])
      nextZIndexRef.current = 1
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return (
    <div className="app">
      <Toolbar
        colors={COLORS}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onAddNote={addNote}
        onClearAll={clearAll}
        zoom={zoom}
        noteCount={notes.length}
      />
      <Canvas
        notes={notes}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onBringToFront={bringToFront}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        gridSize={GRID_SIZE}
      />
    </div>
  )
}

export default App

