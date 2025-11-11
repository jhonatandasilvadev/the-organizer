import { describe, it, expect } from 'vitest'
import { snapToGrid, GRID_SIZE } from '../gridUtils'

describe('gridUtils', () => {
  describe('snapToGrid', () => {
    it('deve retornar o valor correto para múltiplos exatos do grid', () => {
      expect(snapToGrid(0)).toBe(0)
      expect(snapToGrid(20)).toBe(20)
      expect(snapToGrid(40)).toBe(40)
      expect(snapToGrid(100)).toBe(100)
    })

    it('deve arredondar valores próximos ao grid', () => {
      expect(snapToGrid(10)).toBe(20) // 10/20 = 0.5, round = 1, 1*20 = 20
      expect(snapToGrid(30)).toBe(40) // 30/20 = 1.5, round = 2, 2*20 = 40
      expect(snapToGrid(31)).toBe(40) // 31/20 = 1.55, round = 2, 2*20 = 40
      expect(snapToGrid(29)).toBe(20) // 29/20 = 1.45, round = 1, 1*20 = 20
      expect(snapToGrid(15)).toBe(20) // 15/20 = 0.75, round = 1, 1*20 = 20
      expect(snapToGrid(25)).toBe(20) // 25/20 = 1.25, round = 1, 1*20 = 20
    })

    it('deve funcionar com valores negativos', () => {
      expect(snapToGrid(-10)).toBe(0) // -10/20 = -0.5, round = -0, normalizado para 0
      expect(snapToGrid(-30)).toBe(-20) // -30/20 = -1.5, round = -1, -1*20 = -20
      expect(snapToGrid(-31)).toBe(-40) // -31/20 = -1.55, round = -2, -2*20 = -40
      expect(snapToGrid(-29)).toBe(-20) // -29/20 = -1.45, round = -1, -1*20 = -20
      expect(snapToGrid(-15)).toBe(-20) // -15/20 = -0.75, round = -1, -1*20 = -20
      expect(snapToGrid(-35)).toBe(-40) // -35/20 = -1.75, round = -2, -2*20 = -40
    })

    it('deve funcionar com grid size personalizado', () => {
      expect(snapToGrid(15, 10)).toBe(20) // arredonda para 2 * 10
      expect(snapToGrid(25, 10)).toBe(30) // arredonda para 3 * 10
      expect(snapToGrid(12, 5)).toBe(10) // arredonda para 2 * 5
    })

    it('deve usar GRID_SIZE padrão quando não especificado', () => {
      expect(snapToGrid(15)).toBe(Math.round(15 / GRID_SIZE) * GRID_SIZE)
    })
  })
})
