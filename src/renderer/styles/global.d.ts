// src/types/global.d.ts
// 만약 SqlSettings 타입이 필요하다면 이렇게 선언
interface SqlInfo {
  id: string;
  name: string;
  description: string;
  sqlText: string;
}

interface SqlSettings {
  sqlList: SqlInfo[];
  selectedSqlId: string;
}

interface TestResult {
  success: boolean;
  message?: string;
}

import { ElectronAPI, Settings } from '../types/index';
// ↑ 실제로 Settings 타입이 있는 경로에 맞게 작성

declare global {
  interface Window {
    // 중복 선언 제거하고 하나만 유지
    api?: ElectronAPI;
  }
}

export {};
