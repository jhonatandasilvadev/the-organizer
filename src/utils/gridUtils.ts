export const GRID_SIZE = 20

export const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  const result = Math.round(value / gridSize) * gridSize
  // Normalizar -0 para 0
  return result === 0 ? 0 : result
}
