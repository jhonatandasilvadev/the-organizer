import { Note, Folder } from '../types'

export type StoredNotesPayload = {
  notes?: Note[]
  nextZIndex?: number
}

export type StoredFoldersPayload = Folder[]

export const isStoredNotesPayload = (value: unknown): value is StoredNotesPayload => {
  if (typeof value !== 'object' || value === null) return false
  const payload = value as Record<string, unknown>
  const { notes, nextZIndex } = payload

  const notesValid =
    notes === undefined ||
    (Array.isArray(notes) && notes.every((item) => typeof item === 'object' && item !== null))
  const zIndexValid = nextZIndex === undefined || typeof nextZIndex === 'number'

  return notesValid && zIndexValid
}

export const isStoredFoldersPayload = (value: unknown): value is StoredFoldersPayload => {
  return Array.isArray(value)
}
