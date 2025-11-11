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
  // Candidatos para snapping (menor distância)
  const snapCandidates: { x?: number; y?: number; distX?: number; distY?: number } = {}

  otherNotes.forEach((otherNote) => {
    if (otherNote.id === note.id) return

    // Borda esquerda
    const leftDiff = Math.abs(note.x - otherNote.x)
    if (leftDiff < threshold) {
      const candidateX = otherNote.x
      const dist = leftDiff
      if (!snapCandidates.x || dist < snapCandidates.distX!) {
        snapCandidates.x = candidateX
        snapCandidates.distX = dist
        snapX = candidateX
      }
      if (!verticalGuides.has(candidateX)) {
        verticalGuides.set(candidateX, [])
      }
      verticalGuides.get(candidateX)!.push(otherNote.id)
    }

    // Borda direita
    const noteRight = note.x + note.width
    const otherRight = otherNote.x + otherNote.width
    const rightDiff = Math.abs(noteRight - otherRight)
    if (rightDiff < threshold) {
      const candidateX = otherRight - note.width
      const dist = rightDiff
      if (!snapCandidates.x || dist < snapCandidates.distX!) {
        snapCandidates.x = candidateX
        snapCandidates.distX = dist
        snapX = candidateX
      }
      if (!verticalGuides.has(otherRight)) {
        verticalGuides.set(otherRight, [])
      }
      verticalGuides.get(otherRight)!.push(otherNote.id)
    }

    // Centro horizontal (X + width/2)
    const otherCenterX = otherNote.x + otherNote.width / 2
    const noteCenterX = note.x + note.width / 2
    const centerXDiff = Math.abs(noteCenterX - otherCenterX)
    if (centerXDiff < threshold) {
      const candidateX = otherCenterX - note.width / 2
      const dist = centerXDiff
      if (!snapCandidates.x || dist < snapCandidates.distX!) {
        snapCandidates.x = candidateX
        snapCandidates.distX = dist
        snapX = candidateX
      }
      if (!verticalGuides.has(otherCenterX)) {
        verticalGuides.set(otherCenterX, [])
      }
      verticalGuides.get(otherCenterX)!.push(otherNote.id)
    }

    // Borda superior
    const topDiff = Math.abs(note.y - otherNote.y)
    if (topDiff < threshold) {
      const candidateY = otherNote.y
      const dist = topDiff
      if (!snapCandidates.y || dist < snapCandidates.distY!) {
        snapCandidates.y = candidateY
        snapCandidates.distY = dist
        snapY = candidateY
      }
      if (!horizontalGuides.has(candidateY)) {
        horizontalGuides.set(candidateY, [])
      }
      horizontalGuides.get(candidateY)!.push(otherNote.id)
    }

    // Borda inferior
    const noteBottom = note.y + note.height
    const otherBottom = otherNote.y + otherNote.height
    const bottomDiff = Math.abs(noteBottom - otherBottom)
    if (bottomDiff < threshold) {
      const candidateY = otherBottom - note.height
      const dist = bottomDiff
      if (!snapCandidates.y || dist < snapCandidates.distY!) {
        snapCandidates.y = candidateY
        snapCandidates.distY = dist
        snapY = candidateY
      }
      if (!horizontalGuides.has(otherBottom)) {
        horizontalGuides.set(otherBottom, [])
      }
      horizontalGuides.get(otherBottom)!.push(otherNote.id)
    }

    // Centro vertical (Y + height/2)
    const otherCenterY = otherNote.y + otherNote.height / 2
    const noteCenterY = note.y + note.height / 2
    const centerYDiff = Math.abs(noteCenterY - otherCenterY)
    if (centerYDiff < threshold) {
      const candidateY = otherCenterY - note.height / 2
      const dist = centerYDiff
      if (!snapCandidates.y || dist < snapCandidates.distY!) {
        snapCandidates.y = candidateY
        snapCandidates.distY = dist
        snapY = candidateY
      }
      if (!horizontalGuides.has(otherCenterY)) {
        horizontalGuides.set(otherCenterY, [])
      }
      horizontalGuides.get(otherCenterY)!.push(otherNote.id)
    }
  })

  // Adicionar guias verticais (apenas as que estão próximas do snap)
  verticalGuides.forEach((noteIds, position) => {
    // Só adiciona guia se estiver próxima do snap ou se for a única
    if (snapX === undefined || Math.abs(position - (snapX + note.width / 2)) < threshold * 2) {
      guides.push({
        type: 'vertical',
        position,
        notes: noteIds,
      })
    }
  })

  // Adicionar guias horizontais (apenas as que estão próximas do snap)
  horizontalGuides.forEach((noteIds, position) => {
    // Só adiciona guia se estiver próxima do snap ou se for a única
    if (snapY === undefined || Math.abs(position - (snapY + note.height / 2)) < threshold * 2) {
      guides.push({
        type: 'horizontal',
        position,
        notes: noteIds,
      })
    }
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
  threshold: number = 10,
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
