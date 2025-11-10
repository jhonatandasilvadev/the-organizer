// Arquivo principal do Electron (CommonJS)
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    backgroundColor: '#f5f5f7',
    titleBarStyle: 'default',
    frame: true,
    show: false,
    autoHideMenuBar: true,
    title: 'The Organizer',
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  // Verificar se está em modo desenvolvimento
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Modo desenvolvimento: carregar do servidor Vite
    // Você precisa rodar 'npm run dev' em outro terminal primeiro
    mainWindow.loadURL('http://localhost:5173');
    
    // Abrir DevTools em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    // Modo produção: carregar do build
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    const fs = require('fs');
    
    // Verificar se o arquivo existe
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Arquivo de build não encontrado. Execute "npm run build" primeiro.');
      mainWindow.loadURL('data:text/html,<h1>Build não encontrado</h1><p>Execute "npm run build" primeiro.</p>');
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Tratar erros de carregamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (isDev) {
      console.log('Aguardando servidor de desenvolvimento...');
      console.log('Certifique-se de que o servidor Vite está rodando (npm run dev)');
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

