import { describe, it, expect } from 'vitest'
import { isStoredNotesPayload, isStoredFoldersPayload } from '../storageUtils'
import { Folder } from '../../types'

describe('storageUtils', () => {
  describe('isStoredNotesPayload', () => {
    it('deve retornar true para payload válido com notas', () => {
      const payload = {
        notes: [
          {
            id: '1',
            x: 0,
            y: 0,
            width: 240,
            height: 240,
            title: 'Test',
            content: 'Content',
            color: '#000',
            zIndex: 1,
          },
        ],
        nextZIndex: 2,
      }
      expect(isStoredNotesPayload(payload)).toBe(true)
    })

    it('deve retornar true para payload válido sem notas', () => {
      const payload = {
        nextZIndex: 1,
      }
      expect(isStoredNotesPayload(payload)).toBe(true)
    })

    it('deve retornar true para payload válido sem nextZIndex', () => {
      const payload = {
        notes: [],
      }
      expect(isStoredNotesPayload(payload)).toBe(true)
    })

    it('deve retornar false para null', () => {
      expect(isStoredNotesPayload(null)).toBe(false)
    })

    it('deve retornar false para undefined', () => {
      expect(isStoredNotesPayload(undefined)).toBe(false)
    })

    it('deve retornar false para string', () => {
      expect(isStoredNotesPayload('invalid')).toBe(false)
    })

    it('deve retornar false para número', () => {
      expect(isStoredNotesPayload(123)).toBe(false)
    })

    it('deve retornar false para nextZIndex inválido', () => {
      const payload = {
        notes: [],
        nextZIndex: 'invalid',
      }
      expect(isStoredNotesPayload(payload)).toBe(false)
    })

    it('deve retornar false para notas inválidas', () => {
      const payload = {
        notes: 'invalid',
        nextZIndex: 1,
      }
      expect(isStoredNotesPayload(payload)).toBe(false)
    })
  })

  describe('isStoredFoldersPayload', () => {
    it('deve retornar true para array vazio', () => {
      expect(isStoredFoldersPayload([])).toBe(true)
    })

    it('deve retornar true para array de pastas válidas', () => {
      const folders: Folder[] = [
        { id: '1', name: 'Folder 1', createdAt: Date.now(), x: 0, y: 0 },
        { id: '2', name: 'Folder 2', createdAt: Date.now(), x: 0, y: 0 },
      ]
      expect(isStoredFoldersPayload(folders)).toBe(true)
    })

    it('deve retornar false para null', () => {
      expect(isStoredFoldersPayload(null)).toBe(false)
    })

    it('deve retornar false para objeto', () => {
      expect(isStoredFoldersPayload({})).toBe(false)
    })

    it('deve retornar false para string', () => {
      expect(isStoredFoldersPayload('invalid')).toBe(false)
    })

    it('deve retornar false para número', () => {
      expect(isStoredFoldersPayload(123)).toBe(false)
    })
  })
})
