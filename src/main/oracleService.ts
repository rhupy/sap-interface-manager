// src/main/oracleService.ts
import oracledb from 'oracledb';
// 타입 정의는 프로젝트 구조에 맞게, 예) import { OracleDbConfig } from '../renderer/types';

export async function testOracleConnection(dbConfig: any): Promise<void> {
  const { host, port, sid, user, password } = dbConfig;
  const connectString = `${host}:${port}/${sid}`;

  let connection;
  try {
    connection = await oracledb.getConnection({
      user,
      password,
      connectString,
    });
    const result = await connection.execute('SELECT 1 FROM DUAL');
    if (!result.rows || result.rows.length === 0) {
      throw new Error('쿼리 결과가 비어 있습니다.');
    }
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// src/main/rfcService.ts (예시)
import { Client } from 'node-rfc';
// import { RfcConnectionInfo } from '../renderer/types'; // 실제 타입 위치에 맞추어 임포트

export async function testSapRfcConnection(rfcConfig: any): Promise<void> {
  const client = new Client({
    user: rfcConfig.user,
    passwd: rfcConfig.password,
    ashost: rfcConfig.appServerHost,
    sysnr: rfcConfig.systemNumber,
    client: rfcConfig.client,
    lang: rfcConfig.language,
    // 필요 시 다른 파라미터 추가
  });

  try {
    await client.open();
    // 간단하게 Ping 테스트 (SAP에서 자주 쓰는 함수명: STFC_CONNECTION)
    const result = await client.call('STFC_CONNECTION', {
      REQUTEXT: 'Hello SAP',
    });
    if (!result?.ECHOTEXT) {
      throw new Error('RFC Ping 실패');
    }
  } finally {
    if (client.alive) {
      await client.close();
    }
  }
}
