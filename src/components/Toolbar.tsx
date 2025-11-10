import ThemeToggle from './ThemeToggle'
import { Folder } from '../types'
import './Toolbar.css'

interface ToolbarProps {
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
  onAddNote: () => void
  onClearAll: () => void
  zoom: number
  noteCount: number
  folders?: Folder[]
  currentFolderId?: string | null
  currentFolderName?: string | null
  onCreateFolder?: () => void
  onNavigateToFolder?: (folderId: string | null) => void
  onNavigateToMaster?: () => void
  selectedNotesCount?: number
  onMoveSelectedToFolder?: (folderId: string | null) => void
}

function Toolbar({
  colors,
  selectedColor,
  onColorSelect,
  onAddNote,
  onClearAll,
  zoom,
  noteCount,
  folders = [],
  currentFolderId = null,
  currentFolderName = null,
  onCreateFolder,
  onNavigateToFolder,
  onNavigateToMaster,
  selectedNotesCount = 0,
  onMoveSelectedToFolder,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="toolbar-title">The Organizer</h1>
        {currentFolderId && (
          <button 
            className="toolbar-btn back-btn" 
            onClick={onNavigateToMaster}
            title="Voltar para Master Workflow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            Voltar
          </button>
        )}
        {currentFolderName && (
          <div className="folder-breadcrumb">
            <span className="folder-name">{currentFolderName}</span>
          </div>
        )}
        <ThemeToggle />
      </div>

      <div className="toolbar-section toolbar-center">
        <button className="toolbar-btn primary" onClick={onAddNote}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nova Nota
        </button>

        {!currentFolderId && onCreateFolder && (
          <button className="toolbar-btn folder-btn" onClick={onCreateFolder} title="Criar Pasta">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M2 4H6L8 6H14V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V4Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Nova Pasta
          </button>
        )}

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

        {selectedNotesCount > 0 && onMoveSelectedToFolder && folders.length > 0 && (
          <div className="move-to-folder-menu">
            <select 
              className="folder-select"
              onChange={(e) => {
                const folderId = e.target.value === 'master' ? null : e.target.value
                onMoveSelectedToFolder(folderId)
                e.target.value = ''
              }}
              defaultValue=""
            >
              <option value="" disabled>Mover para pasta...</option>
              <option value="master">Master Workflow</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
        )}

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
        {folders.length > 0 && !currentFolderId && (
          <div className="folders-list">
            {folders.map(folder => (
              <button
                key={folder.id}
                className="folder-btn-nav"
                onClick={() => onNavigateToFolder?.(folder.id)}
                title={`Abrir pasta: ${folder.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                  <path d="M2 4H6L8 6H14V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V4Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                {folder.name}
              </button>
            ))}
          </div>
        )}
        <div className="info-badge">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="info-badge">
          Notas: {noteCount}
        </div>
        {selectedNotesCount > 0 && (
          <div className="info-badge selected-count">
            Selecionadas: {selectedNotesCount}
          </div>
        )}
        <div className="hint">
          Ctrl + Scroll: Zoom • Ctrl + Drag: Mover • Shift + Click: Selecionar
        </div>
      </div>
    </div>
  )
}

export default Toolbar

