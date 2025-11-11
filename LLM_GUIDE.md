# Guia para LLMs — The Organizer

Este documento oferece uma visão completa da aplicação para que qualquer modelo consiga entendê-la e modificá-la com segurança.

---

## 1. Visão Geral
- **Projeto**: The Organizer (React + TypeScript + Vite + Electron).
- **Função**: aplicativo visual de notas estilo sticky notes com suporte a pastas e organização em canvas.
- **Persistência**: `localStorage` (`organizer-notes` e `organizer-folders`).
- **Build Desktop**: Electron (`npm run electron:build`).

### Estrutura principal
```
src/
  App.tsx                // Estado global, persistência e orquestração
  components/
    Canvas.tsx           // Canvas com grid, zoom, pan e eventos globais
    StickyNote.tsx       // Componente de nota individual
    FolderCard.tsx       // Componente visual e interativo de pasta
    Toolbar.tsx          // Barra superior com ações e indicadores
    ThemeToggle.tsx      // Alternador de tema (claro/escuro)
  types.ts               // Interfaces compartilhadas
  App.css / ...          // Estilos globais e variáveis
vite.config.ts           // Base './' para suportar Electron e web
```

---

## 2. Modelos de Dados
```ts
// src/types.ts
export interface Note {
  id: string
  x: number
  y: number
  width: number
  height: number
  title: string
  content: string
  color: string
  zIndex: number
  folderId?: string | null // null => Master Workflow
}

export interface Folder {
  id: string
  name: string
  createdAt: number
  x: number
  y: number
}
```

- **Storage**: `organizer-notes` salva array de notas + próximo `zIndex`. `organizer-folders` salva array de pastas (com posição).
- **Master Workflow**: representa o canvas raiz (quando `currentFolderId === null`).

---

## 3. Fluxo de Estado (App.tsx)
1. **Estado global**: `notes`, `folders`, `currentFolderId`, `selectedNotes`, `editingFolderId`, `previewPositions`, `zoom`, `pan` e refs auxiliares.
2. **Carregamento**: `useEffect` inicial lê storage e normaliza posições de pastas com `computeFolderPosition`.
3. **Persistência**: `useEffect` salva notas/pastas a cada alteração.
4. **Criação de nota**: `addNote()` calcula posição (centro no master, layout horizontal nas pastas) e adiciona `Note` com `folderId` atual.
5. **Criação de pasta**: `createFolder()` somente no master; gera nome único e define posição com base no índice.
6. **Navegação**: `navigateToFolder(folderId)` controla entrada/saída de pastas, reseta seleção e `pan/zoom`.
7. **Seleção múltipla**: `handleNoteSelect` mantém `Set<string>`; shift alterna seleção, clique sem shift torna seleção única.
8. **Arraste em grupo**: funções `beginGroupDrag`, `handleGroupDrag`, `endGroupDrag` coordenam pré-visualização (`previewPositions`) e aplicação final com `snapToGrid`.
9. **Organização de notas**: `organizeNotesInFolder` posiciona notas lado a lado ao entrar na pasta ou mover notas para dentro dela.
10. **Exclusão de pasta**: `deleteFolder` remove pasta, move notas associadas para o master e limpa seleções/edições.

---

## 4. Componente Canvas
- **Responsável por**: renderizar grid, notas e pastas; tratar zoom (`Ctrl + Scroll`), pan (`Ctrl + Drag`), limpar seleção ao clicar em áreas vazias.
- **Props chave**:
  - `previewPositions` para mostrar posições temporárias das notas durante arraste em grupo.
  - Callbacks `onGroupDrag*` propagam eventos do `StickyNote` para o `App`.
  - `onDeleteFolder` chamado pelo `FolderCard`.
- **Refs**: `canvasRef` (área total) e `contentRef` (div transformada). Clicar no `contentRef` sem elementos dispara `onClearSelection`.

---

## 5. Componente StickyNote
- **Arraste suave**: durante o mousemove, atualiza `tempPosition` sem snap; ao soltar, aplica `snapToGrid` e chama `onGroupDragEnd`.
- **Seleção**: clique com `Shift` alterna seleção; clique comum seleciona nota e inicia arraste se não for `Ctrl`.
- **Preview**: utiliza `previewPosition` (quando não arrastando) para exibir posição planejada em arraste em grupo.
- **Botão excluir**: agora maior, sempre visível quando hover/selecionado/arrastando.
- **Resizing**: mantém tamanho mínimo `160px` e respeita grid.

---

## 6. Componente FolderCard
- **Interações**:
  - Clique simples: abre pasta ou move notas selecionadas (quando `selectedNotesCount > 0`).
  - Renomear: botão dedicado ativa input inline.
  - Excluir: botão dedicado confirma ação; chama `onDelete`.
  - Arraste: similar às notas, com `snapToGrid` e respeito ao `zoom/pan`.
- **Visual**: ícone azul, sombra vítrea, destaque ao ser alvo de drop (`drop-target`).

---

## 7. Toolbar
- `Nova Nota`, `Nova Pasta` (somente no master), `Limpar Tudo` (contextual).
- Se há notas selecionadas:
  - Mostra botão “Voltar ao Master” (quando dentro de uma pasta).
  - Combo `select` para mover notas para qualquer pasta ou master.
- Indicadores de zoom atual, contagem de notas e selecionadas.

---

## 8. Tema e Estilos
- Variáveis CSS definem temas claro/escuro (ver `App.css`, `index.css`).
- `StickyNote.css` e `FolderCard.css` usam transições para suavizar movimento, hover e foco.
- `ThemeToggle` altera `data-theme` no HTML.

---

## 9. Scripts úteis
```bash
npm run dev           # desenvolvimento web (http://localhost:5173)
npm run build         # build de produção (dist/)
npm run electron:test # roda app Electron em modo produção local
electron .            # mesma coisa que electron:test (usar após build)
npm run electron:dev  # modo dev (exige npm run dev em outro terminal)
npm run electron:build# gera instalador em release/
```

---

## 10. Boas Práticas para Alterações
1. **Sincronização de estados**: qualquer modificação que mude notas/pastas deve atualizar storage e considerar efeitos colaterais (seleção, preview, pasta atual).
2. **Manter `Set` imutável**: sempre crie novos `Set` ao atualizar `selectedNotes`.
3. **Grid**: preserve `GRID_SIZE` (20) ao posicionar notas/pastas.
4. **Arraste em grupo**: use `previewPositions` para evitar repaints pesados; atualize apenas diferença.
5. **Persistência**: valide JSON do storage (try/catch) para evitar corrupção.
6. **Electron**: mantenha `vite.config.ts` com `base: './'`; `electron-main.cjs` usa `dist/index.html` quando `NODE_ENV !== 'development'`.
7. **Novas features**: avalie se pertencem ao Master ou pasta específica; respeite regra de “sem subpastas”.

---

## 11. Possíveis Extensões Futuras
- Sistema de tags/filtros rápidos.
- Busca global por título/conteúdo.
- Sincronização com backend ou export/import de dados.
- Histórico/undo para notas e pastas.

---

## 12. Checklist de QA
- Criar nota no master e dentro de pasta.
- Arrastar nota individual e em grupo (com preview correto).
- Selecionar múltiplas notas com `Shift` e limpar seleção clicando no fundo.
- Criar, renomear, arrastar e excluir pastas; garantir que notas retornem ao master.
- Testar `Limpar Tudo` no master e em pasta.
- Testar atalhos `Ctrl + Scroll` (zoom) e `Ctrl + Drag` (pan).
- Executar `npm run electron:test` para validar empacotamento.

---

Com este guia, qualquer LLM deve entender completamente o projeto e conseguir implementar novas funcionalidades ou ajustes com segurança. Mantendo este arquivo atualizado, garantimos uma boa experiência de colaboração entre agentes.
