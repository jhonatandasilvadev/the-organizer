import { Folder } from '../types'

export const FOLDER_CARD_WIDTH = 180
export const FOLDER_CARD_HEIGHT = 200
export const FOLDER_CARD_SPACING = 32
export const FOLDERS_PER_COLUMN = 4

export const computeFolderPosition = (index: number) => {
  const column = Math.floor(index / FOLDERS_PER_COLUMN)
  const row = index % FOLDERS_PER_COLUMN

  const startX = 40
  const startY = 60

  return {
    x: startX + column * (FOLDER_CARD_WIDTH + FOLDER_CARD_SPACING),
    y: startY + row * (FOLDER_CARD_HEIGHT + FOLDER_CARD_SPACING),
  }
}

export const generateFolderName = (existingFolders: Folder[]): string => {
  const baseName = 'Nova Pasta'
  const existing = new Set(existingFolders.map((folder) => folder.name.toLowerCase()))

  if (!existing.has(baseName.toLowerCase())) {
    return baseName
  }

  let counter = 2
  while (counter < 999) {
    const candidate = `${baseName} ${counter}`
    if (!existing.has(candidate.toLowerCase())) {
      return candidate
    }
    counter += 1
  }

  return `${baseName} ${Date.now()}`
}
