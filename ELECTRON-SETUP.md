# 🚀 Compilar para Electron (App Desktop)

## Preparação

Como você já tem o Electron instalado, siga estes passos:

### 1. Instalar dependências adicionais para build

```bash
npm install electron electron-builder --save-dev
```

### 2. Testar o app Electron em desenvolvimento

Primeiro, certifique-se que o servidor Vite está rodando:
```bash
npm start
```

Em outro terminal, rode o Electron:
```bash
npm run electron:dev
```

### 3. Compilar o app para distribuição

```bash
npm run electron:build
```

O executável será criado na pasta `release/`.

## 📦 Estrutura

- `electron-main.js` - Processo principal do Electron
- `dist/` - Build do React (criado com `npm run build`)
- `release/` - App compilado pronto para distribuir

## 🎨 Personalização

### Adicionar ícone personalizado

1. Crie uma pasta `build/`
2. Adicione seu ícone:
   - Windows: `icon.ico` (256x256)
   - macOS: `icon.icns`
   - Linux: `icon.png` (512x512)

### Configurações do Electron

Edite `electron-main.js` para personalizar:
- Tamanho da janela
- Título
- Menu
- Comportamento

## 🔧 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Compila o React para produção
- `npm run electron:dev` - Abre o app Electron em modo dev
- `npm run electron:build` - Compila o app para distribuição

## ⚠️ Notas

- O app Electron carrega `http://localhost:5173` em desenvolvimento
- Em produção, carrega os arquivos da pasta `dist/`
- localStorage funciona perfeitamente no Electron
- O app será standalone e não precisará de navegador

