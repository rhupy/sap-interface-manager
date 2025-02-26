// main/rfcService.ts
import { Client } from 'node-rfc'; // node-rfc 설치 필요
import { RfcConnectionInfo } from '../renderer/types';

export async function testSapRfcConnection(
  rfcConfig: RfcConnectionInfo
): Promise<void> {
  const client = new Client({
    user: rfcConfig.user,
    passwd: rfcConfig.password,
    ashost: rfcConfig.appServerHost,
    sysnr: rfcConfig.systemNumber,
    client: rfcConfig.client,
    lang: rfcConfig.language,
    // 필요하면 poolSize 등 추가
  });

  try {
    await client.open(); // 접속
    // 간단 RFC 함수 호출 예: "STFC_CONNECTION" 등으로 Ping
    const result = await client.call('STFC_CONNECTION', {
      REQUTEXT: 'Hello SAP',
    });
    // result 에서 ECHOTEXT 등을 체크
    if (!result.ECHOTEXT) {
      throw new Error('RFC Ping 실패');
    }
  } finally {
    // 종료
    if (client.alive) {
      await client.close();
    }
  }
}
