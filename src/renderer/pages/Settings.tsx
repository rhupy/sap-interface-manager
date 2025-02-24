import React, { useEffect, useState } from 'react';
import { GlobalStyle } from '../styles/GlobalStyle';
import {
  Container,
  Divider,
  Section,
  SectionTitle,
  Label,
  Input,
  Select,
  Button,
  Message,
} from '../styles/CommonStyles';
import {
  RfcConnectionInfo,
  DbConnectionConfig,
  RfcConnectionDetail,
} from '../types';
import { OracleDbConfig } from 'src/main/oracleService';

// window 객체에 대한 타입 확장 (preload.ts에서 contextBridge로 노출했다고 가정)
declare global {
  interface Window {
    electron?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
    api: {
      testOracleConnection: (
        dbConfig: OracleDbConfig
      ) => Promise<{ success: boolean; message?: string }>;
      // 필요 시 다른 api 메서드도 추가 (sendMessage, onMessage, getVersion 등)
    };
  }
}

export default function Settings() {
  // RFC 상태들
  const [rfcList, setRfcList] = useState<RfcConnectionInfo[]>([]);
  const [selectedRfc, setSelectedRfc] = useState('');
  const [pingResult, setPingResult] = useState('');
  const [rfcTestResult, setRfcTestResult] = useState('');

  // DB 상태들
  const [dbConnections, setDbConnections] = useState<DbConnectionConfig[]>([]);
  const [selectedDbId, setSelectedDbId] = useState('');
  const [dbTestResult, setDbTestResult] = useState('');

  // 새 DB 입력 값
  const [newDbName, setNewDbName] = useState('');
  const [newDbHost, setNewDbHost] = useState('');
  const [newDbPort, setNewDbPort] = useState('');
  const [newDbSid, setNewDbSid] = useState('');
  const [newDbUser, setNewDbUser] = useState('');
  const [newDbPassword, setNewDbPassword] = useState('');

  // 컴포넌트 마운트 시 RFC 목록 불러오기
  useEffect(() => {
    fetch('http://localhost:5239/connections')
      .then((res) => res.json())
      .then((data: Record<string, RfcConnectionDetail>) => {
        // data 는 { "DEV_SAP": { ... }, "PRD_SAP": { ... } } 형태
        const rfcArray: RfcConnectionInfo[] = Object.entries(data).map(
          ([connectionName, detail]) => ({
            connectionName,
            ...detail, // detail 은 RfcConnectionDetail 타입
          })
        );
        setRfcList(rfcArray);

        // 나머지 로직
      })
      .catch((err) => {
        console.error('RFC 목록 불러오기 오류:', err);
      });
  }, []);

  // ---------------------------------
  // 미들웨어 동작 확인 (ping)
  // ---------------------------------
  const handlePing = async () => {
    setPingResult('확인 중...');
    try {
      const res = await fetch('http://localhost:5239/ping');
      if (!res.ok) throw new Error('ping 실패');
      const text = await res.text();
      setPingResult(`미들웨어 동작 확인: ${text}`);
    } catch (err: any) {
      setPingResult(`오류: ${err.message}`);
    }
  };

  // ---------------------------------
  // RFC 연결 테스트
  // ---------------------------------
  const handleRfcTest = async () => {
    if (!selectedRfc) {
      setRfcTestResult('RFC가 선택되지 않았습니다.');
      return;
    }
    setRfcTestResult('테스트 중...');
    try {
      const url = `http://localhost:5239/connections/test?name=${selectedRfc}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error((await res.text()) || 'RFC 테스트 실패');
      }
      const json = await res.json();
      if (json.success) {
        setRfcTestResult(`RFC 연결 성공: ECHOTEXT='${json.echo}'`);
      } else {
        setRfcTestResult(`RFC 연결 실패: ${json.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      setRfcTestResult(`오류: ${err.message}`);
    }
  };

  // ---------------------------------
  // RFC 선택 저장
  // ---------------------------------
  const handleSaveRfc = () => {
    localStorage.setItem('selectedRfc', selectedRfc);
    alert(`RFC 연결 [${selectedRfc}]가 저장되었습니다.`);
  };

  // ---------------------------------
  // DB 추가
  // ---------------------------------
  const handleAddDb = () => {
    const newConfig: DbConnectionConfig = {
      id: Date.now().toString(),
      name: newDbName.trim(),
      host: newDbHost.trim(),
      port: newDbPort.trim(),
      sid: newDbSid.trim(),
      user: newDbUser.trim(),
      password: newDbPassword.trim(),
    };

    if (!newConfig.name) {
      alert('DB 연결 이름을 입력하세요.');
      return;
    }

    setDbConnections((prev) => [...prev, newConfig]);
    setSelectedDbId(newConfig.id);

    // 입력 폼 초기화
    setNewDbName('');
    setNewDbHost('');
    setNewDbPort('');
    setNewDbSid('');
    setNewDbUser('');
    setNewDbPassword('');
  };

  // ---------------------------------
  // 선택된 DB 삭제
  // ---------------------------------
  const handleDeleteDb = () => {
    if (!selectedDbId) return;
    setDbConnections((prev) => {
      const filtered = prev.filter((db) => db.id !== selectedDbId);
      if (filtered.length > 0) {
        setSelectedDbId(filtered[0].id);
      } else {
        setSelectedDbId('');
      }
      return filtered;
    });
  };

  // ---------------------------------
  // DB 테스트 (IPC)
  // ---------------------------------
  const handleTestDb = async () => {
    if (!window.api) {
      setDbTestResult('Electron API를 사용할 수 없습니다.');
      return;
    }
    if (!selectedDbId) {
      setDbTestResult('테스트할 DB가 선택되지 않았습니다.');
      return;
    }
    const targetDb = dbConnections.find((db) => db.id === selectedDbId);
    if (!targetDb) {
      setDbTestResult('DB 정보를 찾을 수 없습니다.');
      return;
    }

    setDbTestResult('DB 테스트 중...');
    try {
      const result = await window.api.testOracleConnection({
        host: targetDb.host,
        port: targetDb.port,
        sid: targetDb.sid,
        user: targetDb.user,
        password: targetDb.password,
      });
      if (result.success) {
        setDbTestResult(`DB 연결 성공: ${targetDb.name}`);
      } else {
        setDbTestResult(`DB 연결 실패: ${result.message || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      setDbTestResult(`오류 발생: ${err.message}`);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <h2>환경 설정</h2>
        <p>RFC 설정 및 DB 연결 테스트</p>

        {/* ------------------------------------
            RFC 설정 섹션
        ------------------------------------ */}
        <Section>
          <SectionTitle>RFC 설정</SectionTitle>
          <Button onClick={handlePing}>미들웨어 동작 확인</Button>
          {pingResult && (
            <Message
              color={
                pingResult.includes('오류')
                  ? 'red'
                  : pingResult.includes('확인')
                    ? 'green'
                    : '#333'
              }
            >
              {pingResult}
            </Message>
          )}

          <Divider />
          <Label>RFC 목록</Label>
          <Select
            value={selectedRfc}
            onChange={(e) => setSelectedRfc(e.target.value)}
            aria-label="RFC 연결 목록 선택" // 접근성 속성 추가
          >
            {rfcList.length === 0 && (
              <option value="">(등록된 RFC 없음)</option>
            )}
            {rfcList.map((rfc) => (
              <option key={rfc.connectionName} value={rfc.connectionName}>
                {rfc.connectionName}
              </option>
            ))}
          </Select>
          <Button onClick={handleRfcTest}>RFC 연결 테스트</Button>
          <Button onClick={handleSaveRfc}>RFC 선택 저장</Button>
          {rfcTestResult && (
            <Message
              color={
                rfcTestResult.includes('오류') || rfcTestResult.includes('실패')
                  ? 'red'
                  : rfcTestResult.includes('성공')
                    ? 'green'
                    : '#333'
              }
            >
              {rfcTestResult}
            </Message>
          )}
        </Section>

        {/* ------------------------------------
            DB 연결 섹션
        ------------------------------------ */}
        <Section>
          <SectionTitle>DB 연결</SectionTitle>
          <Label>등록된 DB 연결</Label>
          <Select
            value={selectedDbId}
            onChange={(e) => setSelectedDbId(e.target.value)}
            aria-label="DB 연결 목록 선택" // 접근성 속성 추가
          >
            {dbConnections.length === 0 && (
              <option value="">(등록된 DB 없음)</option>
            )}
            {dbConnections.map((db) => (
              <option key={db.id} value={db.id}>
                {db.name} ({db.host}:{db.port}/{db.sid})
              </option>
            ))}
          </Select>
          <Button onClick={handleTestDb}>선택DB 테스트</Button>
          <Button onClick={handleDeleteDb}>선택DB 삭제</Button>
          {dbTestResult && (
            <Message
              color={
                dbTestResult.includes('성공')
                  ? 'green'
                  : dbTestResult.includes('오류') ||
                      dbTestResult.includes('실패')
                    ? 'red'
                    : '#333'
              }
            >
              {dbTestResult}
            </Message>
          )}

          <Divider />
          <SectionTitle>새 DB 추가</SectionTitle>
          <Label>연결 이름</Label>
          <Input
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
          />

          <Label>Host</Label>
          <Input
            value={newDbHost}
            onChange={(e) => setNewDbHost(e.target.value)}
          />

          <Label>Port</Label>
          <Input
            value={newDbPort}
            onChange={(e) => setNewDbPort(e.target.value)}
          />

          <Label>SID</Label>
          <Input
            value={newDbSid}
            onChange={(e) => setNewDbSid(e.target.value)}
          />

          <Label>DB User</Label>
          <Input
            value={newDbUser}
            onChange={(e) => setNewDbUser(e.target.value)}
          />

          <Label>DB Password</Label>
          <Input
            type="password"
            value={newDbPassword}
            onChange={(e) => setNewDbPassword(e.target.value)}
          />

          <Button onClick={handleAddDb}>DB 추가</Button>
        </Section>
      </Container>
    </>
  );
}
