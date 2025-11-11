import { describe, it, expect } from 'vitest'
import { computeFolderPosition, generateFolderName } from '../folderUtils'
import { Folder } from '../../types'

describe('folderUtils', () => {
  describe('computeFolderPosition', () => {
    it('deve calcular a posição correta para o primeiro folder', () => {
      const position = computeFolderPosition(0)
      expect(position.x).toBe(40)
      expect(position.y).toBe(60)
    })

    it('deve calcular a posição correta para o segundo folder', () => {
      const position = computeFolderPosition(1)
      expect(position.x).toBe(40)
      expect(position.y).toBe(292) // 60 + 200 + 32
    })

    it('deve calcular a posição correta para o quinto folder (nova coluna)', () => {
      const position = computeFolderPosition(4)
      expect(position.x).toBe(252) // 40 + 180 + 32
      expect(position.y).toBe(60)
    })

    it('deve calcular a posição correta para múltiplas colunas', () => {
      const position = computeFolderPosition(8)
      expect(position.x).toBe(464) // 40 + 2 * (180 + 32)
      expect(position.y).toBe(60)
    })
  })

  describe('generateFolderName', () => {
    it('deve retornar "Nova Pasta" quando não há pastas existentes', () => {
      const folders: Folder[] = []
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta')
    })

    it('deve retornar "Nova Pasta" quando não existe pasta com esse nome', () => {
      const folders: Folder[] = [
        { id: '1', name: 'Work', createdAt: Date.now(), x: 0, y: 0 },
        { id: '2', name: 'Personal', createdAt: Date.now(), x: 0, y: 0 },
      ]
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta')
    })

    it('deve retornar "Nova Pasta 2" quando já existe "Nova Pasta"', () => {
      const folders: Folder[] = [{ id: '1', name: 'Nova Pasta', createdAt: Date.now(), x: 0, y: 0 }]
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta 2')
    })

    it('deve retornar "Nova Pasta 3" quando já existem "Nova Pasta" e "Nova Pasta 2"', () => {
      const folders: Folder[] = [
        { id: '1', name: 'Nova Pasta', createdAt: Date.now(), x: 0, y: 0 },
        { id: '2', name: 'Nova Pasta 2', createdAt: Date.now(), x: 0, y: 0 },
      ]
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta 3')
    })

    it('deve ignorar diferenças de maiúsculas/minúsculas', () => {
      const folders: Folder[] = [{ id: '1', name: 'NOVA PASTA', createdAt: Date.now(), x: 0, y: 0 }]
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta 2')
    })

    it('deve encontrar o próximo número disponível corretamente', () => {
      const folders: Folder[] = [
        { id: '1', name: 'Nova Pasta', createdAt: Date.now(), x: 0, y: 0 },
        { id: '2', name: 'Nova Pasta 2', createdAt: Date.now(), x: 0, y: 0 },
        { id: '3', name: 'Nova Pasta 4', createdAt: Date.now(), x: 0, y: 0 },
      ]
      const name = generateFolderName(folders)
      expect(name).toBe('Nova Pasta 3')
    })
  })
})
