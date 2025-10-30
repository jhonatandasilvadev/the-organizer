import { useTheme } from '../contexts/ThemeContext'
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
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="toolbar-title">The Organizer</h1>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17 10.5C16.4 13.5 13.5 16 10 16C6 16 3 13 3 9C3 5.5 5.5 2.5 8.5 2C7.5 3 7 4.5 7 6C7 9.5 9.5 12 13 12C14.5 12 16 11.5 17 10.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
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

