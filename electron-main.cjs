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
      devTools: true,
    },
    backgroundColor: '#f5f5f7',
    titleBarStyle: 'default',
    frame: true,
    show: false,
    autoHideMenuBar: true,
    title: 'The Organizer'
  });

  // Carregar do build de produção
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  mainWindow.loadFile(indexPath).catch((err) => {
    console.error('Erro ao carregar arquivo:', err);
  });

  // Abrir DevTools para debug
  mainWindow.webContents.openDevTools();

  // Log de erros
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Console:', message);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Janela mostrada com sucesso');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('App pronto, criando janela...');
  console.log('__dirname:', __dirname);
  console.log('Caminho dist:', path.join(__dirname, 'dist'));
  createWindow();
});

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

