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

// Settings
export interface Settings {
  rfcList: RfcConnectionInfo[];
  dbConnections: DbConnectionConfig[];
  selectedRfc: string;
  selectedDbId: string;
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
