// src/main/preload.ts
import { RfcConnectionInfo } from '@/types';
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

  // [C] RFC 연결 테스트
  testRfcConnection: (rfcConfig: RfcConnectionInfo) =>
    ipcRenderer.invoke('test-rfc-connection', rfcConfig),

  // [D] RFC 함수 테스트
  testRfcFunction: (params: any) =>
    ipcRenderer.invoke('test-rfc-function', params),

  // SQL 실행
  executeSql: (params: any) => ipcRenderer.invoke('execute-sql', params),

  // 설정 파일 열기
  openSettingsFile: () => ipcRenderer.invoke('open-settings-file'),
});
