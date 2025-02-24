import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: (callback: (message: string) => void) =>
    ipcRenderer.on('message-reply', (event, message) => callback(message)),
  getVersion: () => process.versions.electron,
  testOracleConnection: (dbConfig: any) =>
    ipcRenderer.invoke('test-oracle-connection', dbConfig),
});
