import { contextBridge, ipcRenderer } from 'electron';
import { OracleDbConfig } from '../renderer/types/index';

contextBridge.exposeInMainWorld('api', {
  testOracleConnection: (dbConfig: OracleDbConfig) =>
    ipcRenderer.invoke('test-oracle-connection', dbConfig),
  saveSettings: (settings: any) =>
    ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
});
