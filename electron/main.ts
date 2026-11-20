import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeTheme,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
} from 'electron';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Project, SaveResult } from '../src/shared/project';
import { contentHash, readEntries, resolveDocument, writeDocument } from './project';

// The folder each window has open, and the content hash of each document as
// Mosaic last read or wrote it. The renderer can only read and save documents
// inside the folder, and only save documents it has read.
interface OpenFolder {
  root: string;
  baselines: Map<string, string>;
}

const openFolders = new WeakMap<BrowserWindow, OpenFolder>();

// Windows whose renderer has saved its work and may now close.
const readyToClose = new WeakSet<BrowserWindow>();

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

  // Closing waits for the renderer to save open work; see window:close-ready.
  window.on('close', (event) => {
    if (!readyToClose.has(window)) {
      event.preventDefault();
      window.webContents.send('window:close-requested');
    }
  });
  window.webContents.on('render-process-gone', () => readyToClose.add(window));

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
function senderWindow(event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow | null {
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
  openFolders.set(window, { root, baselines: new Map() });
  return { name: path.basename(root), entries };
});

ipcMain.handle('project:read-document', async (event, relative: unknown): Promise<string> => {
  const window = senderWindow(event);
  const folder = window && openFolders.get(window);
  if (!folder || typeof relative !== 'string') {
    throw new Error('No folder is open.');
  }
  const text = await readFile(resolveDocument(folder.root, relative), 'utf8');
  folder.baselines.set(relative, contentHash(text));
  return text;
});

// Failures are returned rather than thrown so the renderer gets a readable
// reason instead of Electron's wrapped error message.
ipcMain.handle(
  'project:save-document',
  async (event, relative: unknown, text: unknown): Promise<SaveResult> => {
    try {
      const window = senderWindow(event);
      const folder = window && openFolders.get(window);
      const baseline = typeof relative === 'string' && folder?.baselines.get(relative);
      if (!folder || !baseline || typeof relative !== 'string' || typeof text !== 'string') {
        throw new Error('That document is not open.');
      }
      const file = resolveDocument(folder.root, relative);
      folder.baselines.set(relative, await writeDocument(file, text, baseline));
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, reason: error instanceof Error ? error.message : String(error) };
    }
  },
);

ipcMain.on('window:close-ready', (event) => {
  const window = senderWindow(event);
  if (window) {
    readyToClose.add(window);
    window.close();
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
