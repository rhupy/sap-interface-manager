// src/types/index.ts
// Settings 인터페이스 : 전 페이지에서 settings.json 파일에 저장되는 설정 정보
export interface Settings {
  rfcList: RfcConnectionInfo[];
  dbConnections: DbConnectionConfig[];
  selectedRfc: string;
  selectedDbId: string;

  // SQL 관리 관련 필드
  sqlList?: SqlInfo[];
  selectedSqlId?: string;

  // RFC 함수 관리 관련 필드
  rfcFunctions?: RfcFunctionInfo[];
  selectedRfcFunctionId?: string;
}

// API 인터페이스
export interface ElectronAPI {
  // 설정 관련
  saveSettings?: (
    settings: Settings
  ) => Promise<{ success: boolean; error?: string }>;
  loadSettings?: () => Promise<Settings | null>;

  // SQL 관련
  loadSqlSettings?: () => Promise<any>;
  saveSqlSettings?: (settings: any) => Promise<void>;

  // DB 연결 테스트
  testDbConnection?: (
    dbConfig: OracleDbConfig
  ) => Promise<{ success: boolean; message?: string }>;

  // RFC 연결 테스트
  testRfcConnection?: (
    rfcConfig: RfcConnectionDetail
  ) => Promise<{ success: boolean; message?: string }>;

  // 설정 파일 열기
  openSettingsFile?: () => Promise<{ success: boolean; message?: string }>;

  // RFC 함수 테스트
  testRfcFunction?: (params: {
    connection: RfcConnectionInfo;
    functionName: string;
    parameters: Record<string, any>;
  }) => Promise<{ success: boolean; message?: string; data?: any }>;
}

// Window 인터페이스 확장
declare global {
  interface Window {
    api?: ElectronAPI;
  }
}

// RFC 접속 정보
export interface RfcConnectionDetail {
  appServerHost: string;
  systemNumber: string;
  systemID: string;
  user: string;
  password: string;
  client: string;
  language: string;
  poolSize: string;
}

export interface RfcConnectionInfo extends RfcConnectionDetail {
  connectionName: string;
}

// DB 연결 설정
export interface OracleDbConfig {
  host: string;
  port: string;
  sid: string;
  user: string;
  password: string;
}

// DB 접속 정보
export interface DbConnectionConfig {
  id: string;
  name: string;
  host: string;
  port: string;
  sid: string;
  user: string;
  password: string;
}

// SQL문 관리
export interface SqlInfo {
  id: string;
  name: string;
  description: string;
  sqlText: string;
  createdAt: string; // 생성 시간 추가
  updatedAt: string; // 수정 시간 추가
  parameters: string[]; // 파라미터 목록 추가
}

// RFC함수 호출 정보
export interface RfcFunctionInfo {
  id: string;
  name: string;
  description: string;
  functionName: string; // SAP RFC 함수 이름
  parameters: RfcParameter[];
  createdAt: string;
  updatedAt: string;
}

// RFC 파라미터
export interface RfcParameter {
  name: string;
  type: 'import' | 'export' | 'table'; // 파라미터 타입
  dataType: string; // 데이터 타입 (STRING, INT, TABLE 등)
  description?: string;
  defaultValue?: string;
}
