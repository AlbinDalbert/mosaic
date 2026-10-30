import { contextBridge, ipcRenderer } from 'electron';
import type { MosaicProjectApi } from '../src/shared/project';
import type { MosaicWindowApi } from '../src/shared/window';

const api: MosaicWindowApi = {
  minimize: () => ipcRenderer.send('window:control', 'minimize'),
  toggleMaximize: () => ipcRenderer.send('window:control', 'toggle-maximize'),
  close: () => ipcRenderer.send('window:control', 'close'),
};

contextBridge.exposeInMainWorld('mosaicWindow', api);

const projectApi: MosaicProjectApi = {
  open: () => ipcRenderer.invoke('project:open'),
  readDocument: (path) => ipcRenderer.invoke('project:read-document', path),
};

contextBridge.exposeInMainWorld('mosaicProject', projectApi);
