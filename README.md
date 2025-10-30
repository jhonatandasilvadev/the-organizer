# The Organizer

Um aplicativo moderno de organização que funciona como planner e sticky notes em um quadro infinito navegável.

## ✨ Características

- 📝 **Notas Adesivas**: Crie notas coloridas e personalizáveis
- 🎨 **4 Cores Essenciais**: Preto (com texto branco), Verde, Vermelho e Azul
- 🌓 **Tema Claro/Escuro**: Alterne entre temas com um clique
- 🔮 **Efeito Glassmorphism**: Vidro fosco ultra-realista nas notas
- 🔍 **Zoom e Pan**: Navegue livremente pelo canvas com Ctrl + Scroll (zoom) e Ctrl + Drag (mover)
- 📐 **Grade Inteligente**: Alinhamento automático à grade para organização perfeita
- ↔️ **Redimensionável**: Ajuste o tamanho das notas como preferir
- 🎯 **Drag & Drop**: Arraste e solte notas facilmente
- 💾 **Salvamento Automático**: Suas notas são salvas automaticamente no navegador
- 🎨 **Design iOS-like**: Interface moderna e minimalista inspirada no design da Apple
- ⚡ **Super Responsivo**: Animações suaves e transições fluidas

## 🚀 Começando

### Pré-requisitos

- Node.js 16+ instalado

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra seu navegador em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🎮 Como Usar

### Controles do Canvas
- **Ctrl + Scroll**: Zoom in/out
- **Ctrl + Drag**: Mover pelo canvas

### Gerenciar Notas
- **Criar Nota**: Clique no botão "+ Nova Nota"
- **Mover Nota**: Clique e arraste a nota
- **Redimensionar**: Arraste pelas bordas ou cantos da nota
- **Editar**: Clique no texto para editar
- **Deletar**: Clique no X no canto superior direito da nota
- **Mudar Cor**: Selecione uma cor antes de criar uma nova nota

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **CSS3** - Estilização com backdrop-filter para efeito glassmorphism

## 📦 Estrutura do Projeto

```
the-organizer/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx        # Canvas principal com zoom e pan
│   │   ├── Canvas.css
│   │   ├── StickyNote.tsx    # Componente de nota individual
│   │   ├── StickyNote.css
│   │   ├── Toolbar.tsx       # Barra de ferramentas
│   │   └── Toolbar.css
│   ├── types.ts              # Tipos TypeScript
│   ├── App.tsx               # Componente principal
│   ├── App.css
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos globais
├── index.html
├── package.json
└── vite.config.ts
```

## 🎨 Paleta de Cores

- ⚫ Preto: `#1d1d1f` (texto branco automático)
- 🟢 Verde: `#34c759`
- 🔴 Vermelho: `#ff3b30`
- 🔵 Azul: `#007aff`

### Cores no Tema Escuro
- ⚫ Preto: `#2c2c2e`
- 🟢 Verde: `#30d158`
- 🔴 Vermelho: `#ff453a`
- 🔵 Azul: `#0a84ff`

## 💡 Funcionalidades Futuras

- [x] Modo escuro ✨
- [x] Sistema de cores personalizadas ✨
- [ ] Exportar/Importar notas
- [ ] Categorias e tags
- [ ] Busca de notas
- [ ] Modo de apresentação
- [ ] Colaboração em tempo real
- [ ] Atalhos de teclado

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

