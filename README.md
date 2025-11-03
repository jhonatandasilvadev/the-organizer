# The Organizer 📝

Um organizador visual elegante e moderno, inspirado no design Apple, para gerenciar suas notas com sticky notes interativos.

## 🚀 Demo ao Vivo

**Live Demo:** [https://jhonatandasilvadev.github.io/the-organizer](https://jhonatandasilvadev.github.io/the-organizer)

## ✨ Recursos

- 📌 **Sticky Notes Interativos** - Crie, mova e redimensione notas facilmente
- 🎨 **Múltiplas Cores** - Escolha entre 4 cores diferentes (Preto, Verde, Vermelho, Azul)
- 🔍 **Zoom e Pan** - Use Ctrl + Scroll para zoom e Ctrl + Drag para navegar
- 🌓 **Tema Claro/Escuro** - Alterne entre temas claro e escuro
- 💾 **Salvamento Automático** - Suas notas são salvas automaticamente no localStorage
- 🎯 **Grade Inteligente** - Notas se alinham automaticamente à grade
- 📱 **Design Responsivo** - Interface moderna e elegante inspirada no iOS

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI moderna
- **TypeScript** - Tipagem estática para código mais seguro
- **Vite** - Build tool ultra-rápido
- **CSS Variables** - Sistema de temas dinâmico
- **GitHub Actions** - CI/CD automático
- **GitHub Pages** - Hospedagem gratuita

## 🚀 Como Usar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

### Deploy para GitHub Pages

O deploy é automático! Ao fazer push para a branch `main`, o GitHub Actions irá:
1. Fazer o build da aplicação
2. Fazer deploy automático para o GitHub Pages

Você também pode fazer deploy manual com:

```bash
npm run deploy
```

### App Electron (Desktop)

Para usar como aplicação desktop:

```bash
# Executar em modo desenvolvimento
npm run electron:dev

# Build do executável
npm run electron:build
```

## 📖 Atalhos de Teclado

- **Ctrl + Scroll** - Zoom in/out
- **Ctrl + Drag** - Mover canvas
- **Drag** - Mover nota
- **Redimensionar** - Arrastar as bordas/cantos da nota

## 🎨 Personalização

### Cores Disponíveis

- 🖤 Preto (#1d1d1f)
- 💚 Verde (#34c759)
- ❤️ Vermelho (#ff3b30)
- 💙 Azul (#007aff)

### Temas

- ☀️ Tema Claro - Design limpo e minimalista
- 🌙 Tema Escuro - Perfeito para trabalhar à noite

## 🏗️ Estrutura do Projeto

```
the-organizer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD do GitHub Actions
├── public/
│   └── .nojekyll               # Configuração GitHub Pages
├── src/
│   ├── components/
│   │   ├── Canvas.tsx          # Canvas principal com zoom/pan
│   │   ├── StickyNote.tsx      # Componente de nota
│   │   ├── Toolbar.tsx         # Barra de ferramentas
│   │   └── ThemeToggle.tsx     # Alternador de tema
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Context API para temas
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Entry point
│   └── types.ts                # Definições TypeScript
├── electron-main.cjs           # Main process do Electron
├── vite.config.ts              # Configuração Vite
└── package.json                # Dependências e scripts
```

## 📦 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento (com host)
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build
- `npm run deploy` - Deploy manual para GitHub Pages
- `npm run electron:dev` - Executa app Electron em desenvolvimento
- `npm run electron:build` - Build do executável Electron

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fork o projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🙏 Agradecimentos

- Design inspirado no Apple iOS
- Ícones SVG customizados
- Comunidade React e TypeScript

---

Desenvolvido com ❤️ por [Jhonatan da Silva](https://github.com/jhonatandasilvadev)
