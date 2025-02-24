import { contextBridge, ipcRenderer } from 'electron';
import { OracleDbConfig } from './oracleService'; // OracleDbConfig 타입 가져오기

contextBridge.exposeInMainWorld('api', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: (callback: (message: string) => void) =>
    ipcRenderer.on('message-reply', (event, message) => callback(message)),
  getVersion: () => process.versions.electron,
  testOracleConnection: (dbConfig: OracleDbConfig) =>
    ipcRenderer.invoke('test-oracle-connection', dbConfig),
});
