// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // [A] 환경설정
  saveSettings: (settings: any) =>
    ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // [B] SQL 설정
  loadSqlSettings: () => ipcRenderer.invoke('load-sql-settings'),
  saveSqlSettings: (settings: any) =>
    ipcRenderer.invoke('save-sql-settings', settings),

  // [C] DB 테스트
  async testDbConnection(dbConfig: any) {
    return ipcRenderer.invoke('test-db-connection', dbConfig);
  },

  // [D] RFC 테스트
  async testRfcConnection(rfcConfig: any) {
    return ipcRenderer.invoke('test-rfc-connection', rfcConfig);
  },
});
