export interface HistoryState {
  notes: unknown[]
  folders: unknown[]
  nextZIndex: number
}

export class HistoryManager {
  private history: HistoryState[] = []
  private currentIndex = -1
  private maxHistorySize = 50

  push(state: HistoryState): void {
    // Remove qualquer estado futuro se estivermos no meio do histórico
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Adiciona novo estado
    this.history.push(JSON.parse(JSON.stringify(state))) // Deep clone
    this.currentIndex = this.history.length - 1

    // Limita o tamanho do histórico
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex = this.maxHistorySize - 1
    }
  }

  undo(): HistoryState | null {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1
      return JSON.parse(JSON.stringify(this.history[this.currentIndex])) // Deep clone
    }
    return null
  }

  redo(): HistoryState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex += 1
      return JSON.parse(JSON.stringify(this.history[this.currentIndex])) // Deep clone
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.currentIndex])) // Deep clone
    }
    return null
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  initialize(state: HistoryState): void {
    this.clear()
    this.push(state)
  }
}
