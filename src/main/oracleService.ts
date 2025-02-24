import oracledb from 'oracledb';

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

/**
 * 오라클에 단순 접속/쿼리 테스트
 */
export async function testOracleConnection(
  dbConfig: OracleDbConfig
): Promise<void> {
  const { host, port, sid, user, password } = dbConfig;

  // EX) host=127.0.0.1, port=1521, sid=ORCL
  const connectString = `${host}:${port}/${sid}`;

  let connection;
  try {
    connection = await oracledb.getConnection({
      user,
      password,
      connectString,
    });
    // 간단 테스트 쿼리
    const result = await connection.execute('SELECT 1 FROM DUAL');
    // 실제 결과 확인은 result.rows 등을 체크
    if (!result.rows || result.rows.length === 0) {
      throw new Error('쿼리 결과가 비어 있음');
    }
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
