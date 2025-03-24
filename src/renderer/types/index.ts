// src/types/index.ts
// Settings 인터페이스 : 전 페이지에서 settings.json 파일에 저장되는 설정 정보
export interface Settings {
  rfcConnections: RfcConnectionInfo[];
  dbConnections: DbConnectionConfig[];
  selectedRfc: string;
  selectedDbId: string;

  // SQL 관리
  sqlList?: SqlInfo[];
  selectedSqlId?: string;

  // RFC 함수 관리
  rfcFunctions?: RfcFunctionInfo[];
  selectedRfcFunctionId?: string;

  // 인터페이스 관리
  interfaces?: InterfaceInfo[];
  selectedInterfaceId?: string;

  // 프로젝트 관리
  projects?: ProjectInfo[]; // 프로젝트 목록
  selectedProjectId?: string; // 현재 선택된 프로젝트 ID

  // 로그 저장 경로
  logStoragePath?: string; // 로그 저장 경로, 없으면 기본값 C:\InterfaceLogs
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
    dbConfig: DbConnectionConfig
  ) => Promise<{ success: boolean; message?: string }>;

  // RFC 연결 테스트
  testRfcConnection?: (
    rfcConfig: RfcConnectionInfo
  ) => Promise<{ success: boolean; message?: string }>;

  // RFC 함수 테스트
  testRfcFunction?: (params: {
    connection: RfcConnectionInfo;
    functionName: string;
    parameters: Record<string, any>;
  }) => Promise<{ success: boolean; message?: string; data?: any }>;

  // SQL 실행 메서드
  executeSql?: (params: {
    connection: DbConnectionConfig;
    query: string;
  }) => Promise<{ success: boolean; message?: string; data?: any }>;

  // 설정 파일 열기
  openSettingsFile?: () => Promise<{ success: boolean; message?: string }>;
}

// Window 인터페이스 확장
declare global {
  interface Window {
    api?: ElectronAPI;
  }
}

// RFC 접속 정보
export interface RfcConnectionInfo {
  id: string;
  connectionName: string;
  appServerHost: string;
  systemNumber: string;
  systemID: string;
  user: string;
  password: string;
  client: string;
  language: string;
  poolSize: string;
}

// DB 접속 정보
export interface DbConnectionConfig {
  id: string;
  connectionName: string;
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
  createdAt: string; // 생성 시간
  updatedAt: string; // 수정 시간
  parameters: string[]; // 파라미터 목록
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
  type: 'import' | 'export'; // 파라미터 타입 : 'table'은 제거
  dataType: string; // 데이터 타입 (STRING, INT, TABLE 등)
  description?: string;
  defaultValue?: string;
}

// 인터페이스 정보
export interface InterfaceInfo {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  steps: InterfaceStep[];
}

// 인터페이스 작업 (RFC 또는 SQL)
export interface InterfaceStep {
  id: string;
  type: 'rfc' | 'sql';
  name: string;
  referenceId: string; // RFC 함수 ID 또는 SQL ID
  order: number;
  parameters?: Record<string, string>; // 파라미터 매핑 정보
}

// 실행 로그 타입 정의
export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'error' | 'success' | 'warning';
  message: string;
  details?: any;
}

// 실행 상태 타입 정의
export interface ExecutionState {
  isRunning: boolean;
  currentStepIndex: number;
  logs: ExecutionLog[];
  results: any[];
  error?: string;
}

// 프로젝트 관리
export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  selectedRfc: string;
  selectedDbId: string;
  createdAt: string;
  updatedAt: string;
  interfaceConfigs: ProjectInterfaceConfig[]; // 프로젝트에 포함된 interface의 ID 목록
}

export interface ProjectInterfaceConfig {
  id: string; // InterfaceInfo.id
  enabled: boolean; // 활성화 여부 (체크박스)
  scheduleMin: number; // 자동실행 주기 (분)
}
