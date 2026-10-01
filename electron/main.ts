import { app, BrowserWindow, ipcMain, Menu, nativeTheme } from 'electron';
import path from 'node:path';

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Mosaic',
    frame: false,
    show: false,
    backgroundColor: '#0c0b09',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  window.once('ready-to-show', () => window.show());

  const devServerUrl = process.env.MOSAIC_DEV_SERVER_URL;
  const loaded = devServerUrl
    ? window.loadURL(devServerUrl)
    : window.loadFile(path.join(__dirname, '..', 'dist', 'renderer', 'index.html'));

  void loaded.catch((error: unknown) => {
    console.error('Failed to load the Mosaic window.', error);
    app.exit(1);
  });
}

ipcMain.on('window:control', (event, action: unknown) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window || event.senderFrame !== window.webContents.mainFrame) {
    return;
  }

  switch (action) {
    case 'minimize':
      window.minimize();
      break;
    case 'toggle-maximize':
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
      break;
    case 'close':
      window.close();
      break;
  }
});

void app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error: unknown) => {
  console.error('Failed to start Mosaic.', error);
  app.exit(1);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
