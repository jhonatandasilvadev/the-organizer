import ThemeToggle from './ThemeToggle'
import './Toolbar.css'

interface ToolbarProps {
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
  onAddNote: () => void
  onClearAll: () => void
  zoom: number
  noteCount: number
}

function Toolbar({
  colors,
  selectedColor,
  onColorSelect,
  onAddNote,
  onClearAll,
  zoom,
  noteCount,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="toolbar-title">The Organizer</h1>
        <ThemeToggle />
      </div>

      <div className="toolbar-section toolbar-center">
        <button className="toolbar-btn primary" onClick={onAddNote}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nova Nota
        </button>

        <div className="color-picker">
          {colors.map(color => (
            <button
              key={color}
              className={`color-btn ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={`Selecionar cor ${color}`}
            />
          ))}
        </div>

        {noteCount > 0 && (
          <button className="toolbar-btn danger" onClick={onClearAll}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Limpar Tudo
          </button>
        )}
      </div>

      <div className="toolbar-section toolbar-info">
        <div className="info-badge">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="info-badge">
          Notas: {noteCount}
        </div>
        <div className="hint">
          Ctrl + Scroll: Zoom • Ctrl + Drag: Mover
        </div>
      </div>
    </div>
  )
}

export default Toolbar

