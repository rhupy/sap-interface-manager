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

// RFC 함수 테스트 함수
export async function testSapRfcFunction(params: {
  connection: RfcConnectionInfo;
  functionName: string;
  parameters: Record<string, any>;
}): Promise<any> {
  const { connection, functionName, parameters } = params;

  const client = new Client({
    user: connection.user,
    passwd: connection.password,
    ashost: connection.appServerHost,
    sysnr: connection.systemNumber,
    client: connection.client,
    lang: connection.language,
  });

  try {
    await client.open();
    console.log(`RFC 함수 호출: ${functionName}`, parameters);

    // 실제 RFC 함수 호출
    let result = await client.call(functionName, parameters);
    // TEMP. 출력 파라미터 메뉴얼 추가
    // result = {
    //   ...result,
    //   OUTTAB: [
    //     {
    //       MATNR: '1234567890',
    //       MAKTX: '테스트 상품',
    //     },
    //     {
    //       MATNR: '1234567891',
    //       MAKTX: '테스트 상품2',
    //     },
    //     {
    //       MATNR: '1234567892',
    //       MAKTX: '테스트 상품3',
    //     },
    //     {
    //       MATNR: '1234567893',
    //       MAKTX: '테스트 상품4',
    //     },
    //     {
    //       MATNR: '1234567894',
    //       MAKTX: '테스트 상품5',
    //     },
    //   ],
    // };

    console.log('RFC 함수 호출 결과:', result);
    return result;
  } finally {
    if (client.alive) {
      await client.close();
    }
  }
}
