// src/main/preload.ts
import { RfcConnectionInfo } from '@/types';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // 환경설정
  saveSettings: (settings: any) =>
    ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // SQL 설정
  loadSqlSettings: () => ipcRenderer.invoke('load-sql-settings'),
  saveSqlSettings: (settings: any) =>
    ipcRenderer.invoke('save-sql-settings', settings),

  // DB 테스트
  async testDbConnection(dbConfig: any) {
    return ipcRenderer.invoke('test-db-connection', dbConfig);
  },

  // RFC 연결 테스트
  testRfcConnection: (rfcConfig: RfcConnectionInfo) =>
    ipcRenderer.invoke('test-rfc-connection', rfcConfig),

  // RFC 함수 테스트
  testRfcFunction: (params: any) =>
    ipcRenderer.invoke('test-rfc-function', params),

  // SQL 실행
  executeSql: (params: any) => ipcRenderer.invoke('execute-sql', params),

  // 설정 파일 열기
  openSettingsFile: () => ipcRenderer.invoke('open-settings-file'),

  // ----------------------------------
  // 프로젝트 로그 추가 (파일 Append)
  // ----------------------------------
  appendProjectLog: (args: {
    projectName: string;
    interfaceName: string;
    logStoragePath: string; // 기본값이 있으면 렌더러단에서 처리
    logLine: string; // 실제로 남길 로그 문자열
  }) => {
    return ipcRenderer.invoke('append-project-log', args);
  },
});
