// src/types/index.ts
// RFC
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

// DB
export interface DbConnectionConfig {
  id: string;
  name: string;
  host: string;
  port: string;
  sid: string;
  user: string;
  password: string;
}

// SQL 관리
export interface SqlInfo {
  id: string;
  name: string;
  description: string;
  sqlText: string;
  createdAt: string; // 생성 시간 추가
  updatedAt: string; // 수정 시간 추가
  parameters: string[]; // 파라미터 목록 추가
}

// Settings
export interface Settings {
  rfcList: RfcConnectionInfo[];
  dbConnections: DbConnectionConfig[];
  selectedRfc: string;
  selectedDbId: string;

  // SQL 관리 관련 필드 추가
  sqlList?: SqlInfo[];
  selectedSqlId?: string;
}

/**
 * DB 연결 설정
 */
export interface OracleDbConfig {
  host: string;
  port: string;
  sid: string;
  user: string;
  password: string;
}
