import { contextBridge, ipcRenderer } from 'electron';
import type { MosaicWindowApi } from '../src/shared/window';

const api: MosaicWindowApi = {
  minimize: () => ipcRenderer.send('window:control', 'minimize'),
  toggleMaximize: () => ipcRenderer.send('window:control', 'toggle-maximize'),
  close: () => ipcRenderer.send('window:control', 'close'),
};

contextBridge.exposeInMainWorld('mosaicWindow', api);
