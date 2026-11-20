import { contextBridge, ipcRenderer } from 'electron';
import type { MosaicProjectApi, SaveResult } from '../src/shared/project';
import type { MosaicWindowApi } from '../src/shared/window';

let closeHandler = async () => true;

ipcRenderer.on('window:close-requested', async () => {
  if (await closeHandler()) {
    ipcRenderer.send('window:close-ready');
  }
});

const api: MosaicWindowApi = {
  minimize: () => ipcRenderer.send('window:control', 'minimize'),
  toggleMaximize: () => ipcRenderer.send('window:control', 'toggle-maximize'),
  close: () => ipcRenderer.send('window:control', 'close'),
  onCloseRequested: (handler) => {
    closeHandler = handler;
  },
};

contextBridge.exposeInMainWorld('mosaicWindow', api);

const projectApi: MosaicProjectApi = {
  open: () => ipcRenderer.invoke('project:open'),
  readDocument: (path) => ipcRenderer.invoke('project:read-document', path),
  saveDocument: async (path, text) => {
    const result: SaveResult = await ipcRenderer.invoke('project:save-document', path, text);
    if (!result.ok) {
      throw new Error(result.reason);
    }
  },
};

contextBridge.exposeInMainWorld('mosaicProject', projectApi);
