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

import { Settings } from '../types/index';
// ↑ 실제로 Settings 타입이 있는 경로에 맞게 작성

declare global {
  interface Window {
    api?: {
      // [A] 환경설정
      saveSettings?: (settings: any) => Promise<void>;
      loadSettings?: () => Promise<Settings | null>;

      // [B] SQL
      loadSqlSettings?: () => Promise<SqlSettings | null>;
      saveSqlSettings?: (settings: SqlSettings) => Promise<void>;

      // [C] RFC/DB 테스트
      testDbConnection?: (dbConfig: any) => Promise<TestResult>;
      testRfcConnection?: (rfcConfig: any) => Promise<TestResult>;
    };
  }
}

export {};
