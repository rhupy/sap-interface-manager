// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // 1) 설정 저장/불러오기
  saveSettings: (settings: any) =>
    ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // 2) DB 테스트
  async testDbConnection(dbConfig: any) {
    return ipcRenderer.invoke('test-db-connection', dbConfig);
  },

  // 3) RFC 테스트
  async testRfcConnection(rfcConfig: any) {
    return ipcRenderer.invoke('test-rfc-connection', rfcConfig);
  },
});
