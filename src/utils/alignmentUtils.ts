import { Note } from '../types'

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal'
  position: number
  notes: string[] // IDs das notas alinhadas
}

export interface AlignmentResult {
  guides: AlignmentGuide[]
  snapX?: number
  snapY?: number
}

/**
 * Detecta guias de alinhamento para uma nota em relação a outras notas
 */
export const detectAlignmentGuides = (
  note: Note,
  otherNotes: Note[],
  threshold: number = 5,
): AlignmentResult => {
  const guides: AlignmentGuide[] = []
  let snapX: number | undefined
  let snapY: number | undefined

  // Guias verticais (alinhamento horizontal - mesma coordenada X)
  const verticalGuides = new Map<number, string[]>()
  // Guias horizontais (alinhamento vertical - mesma coordenada Y)
  const horizontalGuides = new Map<number, string[]>()

  otherNotes.forEach((otherNote) => {
    if (otherNote.id === note.id) return

    // Centro horizontal (X + width/2)
    const otherCenterX = otherNote.x + otherNote.width / 2
    const noteCenterX = note.x + note.width / 2
    const centerXDiff = Math.abs(noteCenterX - otherCenterX)
    if (centerXDiff < threshold) {
      const guideX = otherCenterX - note.width / 2
      if (!verticalGuides.has(guideX)) {
        verticalGuides.set(guideX, [])
      }
      verticalGuides.get(guideX)!.push(otherNote.id)
      if (!snapX) {
        snapX = guideX
      }
    }

    // Centro vertical (Y + height/2)
    const otherCenterY = otherNote.y + otherNote.height / 2
    const noteCenterY = note.y + note.height / 2
    const centerYDiff = Math.abs(noteCenterY - otherCenterY)
    if (centerYDiff < threshold) {
      const guideY = otherCenterY - note.height / 2
      if (!horizontalGuides.has(guideY)) {
        horizontalGuides.set(guideY, [])
      }
      horizontalGuides.get(guideY)!.push(otherNote.id)
      if (!snapY) {
        snapY = guideY
      }
    }

    // Borda esquerda
    const leftDiff = Math.abs(note.x - otherNote.x)
    if (leftDiff < threshold) {
      edgeGuides.push({ type: 'left', position: otherNote.x, noteId: otherNote.id })
      if (!snapX) {
        snapX = otherNote.x
      }
    }

    // Borda direita
    const rightDiff = Math.abs(note.x + note.width - (otherNote.x + otherNote.width))
    if (rightDiff < threshold) {
      edgeGuides.push({
        type: 'right',
        position: otherNote.x + otherNote.width - note.width,
        noteId: otherNote.id,
      })
      if (!snapX) {
        snapX = otherNote.x + otherNote.width - note.width
      }
    }

    // Borda superior
    const topDiff = Math.abs(note.y - otherNote.y)
    if (topDiff < threshold) {
      edgeGuides.push({ type: 'top', position: otherNote.y, noteId: otherNote.id })
      if (!snapY) {
        snapY = otherNote.y
      }
    }

    // Borda inferior
    const bottomDiff = Math.abs(note.y + note.height - (otherNote.y + otherNote.height))
    if (bottomDiff < threshold) {
      edgeGuides.push({
        type: 'bottom',
        position: otherNote.y + otherNote.height - note.height,
        noteId: otherNote.id,
      })
      if (!snapY) {
        snapY = otherNote.y + otherNote.height - note.height
      }
    }
  })

  // Adicionar guias verticais
  verticalGuides.forEach((noteIds, position) => {
    guides.push({
      type: 'vertical',
      position,
      notes: noteIds,
    })
  })

  // Adicionar guias horizontais
  horizontalGuides.forEach((noteIds, position) => {
    guides.push({
      type: 'horizontal',
      position,
      notes: noteIds,
    })
  })

  return {
    guides,
    snapX,
    snapY,
  }
}

/**
 * Aplica snapping a uma posição baseado nas guias de alinhamento
 */
export const applySnapping = (
  x: number,
  y: number,
  width: number,
  height: number,
  otherNotes: Note[],
  threshold: number = 5,
): { x: number; y: number; guides: AlignmentGuide[] } => {
  const tempNote: Note = {
    id: 'temp',
    x,
    y,
    width,
    height,
    title: '',
    content: '',
    color: '#ffffff',
    zIndex: 0,
  }

  const alignment = detectAlignmentGuides(tempNote, otherNotes, threshold)

  return {
    x: alignment.snapX ?? x,
    y: alignment.snapY ?? y,
    guides: alignment.guides,
  }
}
