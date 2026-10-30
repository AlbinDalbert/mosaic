import { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, type IpcMainInvokeEvent } from 'electron';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Project } from '../src/shared/project';
import { readEntries, resolveDocument } from './project';

// The folder each window has open. The renderer can only read documents
// inside it.
const openFolders = new WeakMap<BrowserWindow, string>();

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Mosaic',
    frame: false,
    show: false,
    backgroundColor: '#0a0603',
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

// Returns the window that sent a request, if it came from its main frame.
function senderWindow(event: IpcMainInvokeEvent): BrowserWindow | null {
  const window = BrowserWindow.fromWebContents(event.sender);
  return window && event.senderFrame === window.webContents.mainFrame ? window : null;
}

ipcMain.handle('project:open', async (event): Promise<Project | null> => {
  const window = senderWindow(event);
  if (!window) {
    return null;
  }
  const result = await dialog.showOpenDialog(window, { properties: ['openDirectory'] });
  const root = result.filePaths[0];
  if (result.canceled || !root) {
    return null;
  }
  const entries = await readEntries(root);
  openFolders.set(window, root);
  return { name: path.basename(root), entries };
});

ipcMain.handle('project:read-document', async (event, relative: unknown): Promise<string> => {
  const window = senderWindow(event);
  const root = window && openFolders.get(window);
  if (!root || typeof relative !== 'string') {
    throw new Error('No folder is open.');
  }
  return readFile(resolveDocument(root, relative), 'utf8');
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
