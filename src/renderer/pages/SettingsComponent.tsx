// src/renderer/pages/SettingsComponent.tsx

import React, { useState, useEffect } from 'react';
import {
  ContentContainer,
  Title,
  Description,
  Button,
  Input,
  Select,
  Label,
  Section,
  SectionTitle,
  FixedMessage,
} from '../styles/CommonStyles';
import { useSettingsContext } from '../context/SettingContext';
import { RfcConnectionInfo, DbConnectionConfig } from '../types';

// RFC/DB를 비웠을 때 사용하기 위한 객체
const emptyRfc: RfcConnectionInfo = {
  connectionName: '',
  appServerHost: '',
  systemNumber: '',
  systemID: '',
  user: '',
  password: '',
  client: '',
  language: '',
  poolSize: '',
};

const emptyDb: DbConnectionConfig = {
  id: '',
  name: '',
  host: '',
  port: '',
  sid: '',
  user: '',
  password: '',
};

export default function SettingsComponent() {
  // -------------------------
  // 상태 관리
  // -------------------------
  const {
    settings,
    updateSettings,
    isLoading: isSettingsLoading,
  } = useSettingsContext();

  // 메시지 출력
  const [message, setMessage] = useState<string>('');

  // 현재 편집 중인 RFC/DB 정보
  const [newRfc, setNewRfc] = useState<RfcConnectionInfo>(emptyRfc);
  const [newDb, setNewDb] = useState<DbConnectionConfig>(emptyDb);

  // -------------------------
  // 3) selectedRfc, selectedDbId 변화에 따라
  //    newRfc, newDb를 갱신(드롭다운 선택 시)
  // -------------------------
  useEffect(() => {
    if (!settings.selectedRfc) {
      // 'RFC 선택'인 경우 입력창 초기화
      setNewRfc(emptyRfc);
    } else {
      const found = settings.rfcList.find(
        (r) => r.connectionName === settings.selectedRfc
      );
      if (found) setNewRfc(found);
      else setNewRfc(emptyRfc);
    }
  }, [settings.selectedRfc]);

  useEffect(() => {
    if (!settings.selectedDbId) {
      // 'DB 선택'인 경우 입력창 초기화
      setNewDb(emptyDb);
    } else {
      const found = settings.dbConnections.find(
        (db) => db.id === settings.selectedDbId
      );
      if (found) setNewDb(found);
      else setNewDb(emptyDb);
    }
  }, [settings.selectedDbId]);

  // -------------------------
  // 4) 이벤트 핸들러(드롭다운)
  // -------------------------
  const handleRfcSelect = (value: string) => {
    updateSettings({ selectedRfc: value });
  };

  const handleDbSelect = (value: string) => {
    updateSettings({ selectedDbId: value });
  };

  // -------------------------
  // 5) RFC 관련 메서드
  // -------------------------
  // (1) RFC 추가
  const addRfcConnection = () => {
    if (newRfc.connectionName && newRfc.appServerHost) {
      const isDuplicate = settings.rfcList.some(
        (rfc) => rfc.connectionName === newRfc.connectionName
      );
      if (isDuplicate) {
        setMessage('이미 존재하는 연결 이름입니다.');
        return;
      }
      updateSettings({
        rfcList: [...settings.rfcList, newRfc],
      });
      setNewRfc(emptyRfc);
      setMessage('RFC 연결이 추가되었습니다.');
    } else {
      setMessage('연결 이름과 호스트를 입력하세요.');
    }
  };

  // (2) RFC 삭제
  const deleteRfcConnection = (connectionName: string) => {
    if (!connectionName) {
      setMessage('삭제할 RFC 연결이 선택되지 않았습니다.');
      return;
    }
    updateSettings((prev) => ({
      ...prev, // 기존 모든 속성 유지
      rfcList: prev.rfcList.filter(
        (rfc) => rfc.connectionName !== connectionName
      ),
      // 현재 선택된 RFC가 삭제 대상이면 selectedRfc 비우기
      selectedRfc: prev.selectedRfc === connectionName ? '' : prev.selectedRfc,
    }));
    setMessage('RFC 연결이 삭제되었습니다.');
  };

  // (3) RFC 수정
  const updateRfcConnection = () => {
    if (settings.selectedRfc && newRfc.connectionName && newRfc.appServerHost) {
      // 중복 검사 (본인 제외)
      const isDuplicate = settings.rfcList.some(
        (rfc) =>
          rfc.connectionName === newRfc.connectionName &&
          rfc.connectionName !== settings.selectedRfc
      );
      if (isDuplicate) {
        setMessage('이미 존재하는 연결 이름입니다.');
        return;
      }
      updateSettings((prev) => ({
        ...prev, // 기존 모든 속성 유지
        rfcList: prev.rfcList.map((rfc) =>
          rfc.connectionName === prev.selectedRfc ? newRfc : rfc
        ),
        // 새 이름으로 바뀌었으면 selectedRfc도 갱신
        selectedRfc: newRfc.connectionName,
      }));
      setMessage('RFC 연결이 수정되었습니다.');
    } else {
      setMessage('선택된 RFC가 없거나 연결 이름/호스트가 비어 있습니다.');
    }
  };

  // (4) RFC 테스트 (구현)
  const testRfcConnection = async () => {
    if (!window.api?.testRfcConnection) {
      setMessage('RFC 테스트 기능이 지원되지 않습니다.');
      return;
    }

    if (settings.selectedRfc) {
      const rfc = settings.rfcList.find(
        (r) => r.connectionName === settings.selectedRfc
      );
      if (!rfc) {
        setMessage('선택된 RFC 연결 정보를 찾지 못했습니다.');
        return;
      }
      try {
        const result = await window.api.testRfcConnection({
          // 필요한 필드만 전달
          appServerHost: rfc.appServerHost,
          systemNumber: rfc.systemNumber,
          systemID: rfc.systemID,
          user: rfc.user,
          password: rfc.password,
          client: rfc.client,
          language: rfc.language,
          poolSize: rfc.poolSize,
        });
        if (result.success) {
          setMessage(`RFC "${rfc.connectionName}" 연결 테스트 성공`);
        } else {
          setMessage(
            `RFC "${rfc.connectionName}" 연결 테스트 실패: ${result.message || ''}`
          );
        }
      } catch (error: any) {
        setMessage(
          `RFC "${rfc.connectionName}" 연결 테스트 에러: ${error?.message || error}`
        );
      }
    } else {
      setMessage('RFC 연결을 선택하세요.');
    }
  };

  // -------------------------
  // 6) DB 관련 메서드
  // -------------------------
  // (1) DB 추가
  const addDbConnection = () => {
    if (newDb.name && newDb.host) {
      const isDuplicate = settings.dbConnections.some(
        (db) => db.name === newDb.name
      );
      if (isDuplicate) {
        setMessage('이미 존재하는 연결 이름입니다.');
        return;
      }
      const newId = `db-${Date.now()}`;
      updateSettings({
        dbConnections: [...settings.dbConnections, { ...newDb, id: newId }],
      });
      setNewDb(emptyDb);
      setMessage('DB 연결이 추가되었습니다.');
    } else {
      setMessage('연결 이름과 호스트를 입력하세요.');
    }
  };

  // (2) DB 삭제
  const deleteDbConnection = (dbId: string) => {
    if (!dbId) {
      setMessage('삭제할 DB 연결이 선택되지 않았습니다.');
      return;
    }
    updateSettings((prev) => ({
      ...prev, // 기존 모든 속성 유지
      dbConnections: prev.dbConnections.filter((db) => db.id !== dbId),
      // 현재 선택된 DB가 삭제 대상이면 selectedDbId 비우기
      selectedDbId: prev.selectedDbId === dbId ? '' : prev.selectedDbId,
    }));
    setMessage('DB 연결이 삭제되었습니다.');
  };

  // (3) DB 수정
  const updateDbConnection = () => {
    if (settings.selectedDbId && newDb.name && newDb.host) {
      // 다른 DB와 중복 이름 검사
      const isDuplicate = settings.dbConnections.some(
        (db) => db.name === newDb.name && db.id !== settings.selectedDbId
      );
      if (isDuplicate) {
        setMessage('이미 존재하는 연결 이름입니다.');
        return;
      }
      updateSettings((prev) => ({
        ...prev, // 기존 모든 속성 유지
        dbConnections: prev.dbConnections.map((db) =>
          db.id === prev.selectedDbId ? { ...newDb, id: db.id } : db
        ),
      }));
      setMessage('DB 연결이 수정되었습니다.');
    } else {
      setMessage('선택된 DB가 없거나 연결 이름/호스트가 비어 있습니다.');
    }
  };

  // (4) DB 테스트 (구현)
  const testDbConnection = async () => {
    if (!window.api?.testDbConnection) {
      setMessage('DB 테스트 기능이 지원되지 않습니다.');
      return;
    }

    if (settings.selectedDbId) {
      const db = settings.dbConnections.find(
        (d) => d.id === settings.selectedDbId
      );
      if (!db) {
        setMessage('선택된 DB 연결 정보를 찾지 못했습니다.');
        return;
      }
      try {
        const result = await window.api.testDbConnection({
          host: db.host,
          port: db.port,
          sid: db.sid,
          user: db.user,
          password: db.password,
        });
        if (result.success) {
          setMessage(`DB "${db.name}" 연결 테스트 성공`);
        } else {
          setMessage(
            `DB "${db.name}" 연결 테스트 실패: ${result.message || ''}`
          );
        }
      } catch (error: any) {
        setMessage(
          `DB "${db.name}" 연결 테스트 에러: ${error?.message || error}`
        );
      }
    } else {
      setMessage('DB 연결을 선택하세요.');
    }
  };

  // 설정 파일 열기 함수 추가
  const openSettingsFile = async () => {
    if (!window.api?.openSettingsFile) {
      setMessage('설정 파일 열기 기능이 지원되지 않습니다.');
      return;
    }

    try {
      const result = await window.api.openSettingsFile();
      if (result.success) {
        setMessage('설정 파일을 열었습니다.');
      } else {
        setMessage(`설정 파일 열기 실패: ${result.message || ''}`);
      }
    } catch (error: any) {
      setMessage(`설정 파일 열기 에러: ${error?.message || error}`);
    }
  };

  // -------------------------
  // 로딩 중 처리
  // -------------------------
  if (isSettingsLoading) {
    return <div>설정을 불러오는 중...</div>;
  }

  // -------------------------
  // 실제 렌더링
  // -------------------------
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <Title>환경 설정</Title>
        {/* 설정 파일 열기 버튼 */}
        <Button
          onClick={openSettingsFile}
          style={{
            backgroundColor: '#6c757d', // 회색 계열 색상으로 변경
            padding: '6px 12px', // 버튼 크기 축소
            fontSize: '0.9rem', // 글자 크기 축소
          }}
        >
          설정 파일 열기
        </Button>
      </div>
      {/* <Description>RFC 및 DB 연결 설정을 관리하세요.</Description> */}

      <ContentContainer style={{ flex: 'none' }}>
        {/* ---------- RFC 영역 ---------- */}
        <Section style={{ width: '800px', height: '380px' }}>
          <SectionTitle>RFC 연결 설정</SectionTitle>
          <div>
            <Label>RFC 선택</Label>
            <Select
              value={settings.selectedRfc}
              style={{ width: '200px', marginRight: '10px' }}
              onChange={(e) => handleRfcSelect(e.target.value)}
            >
              <option value="">RFC 선택</option>
              {settings.rfcList.map((rfc) => (
                <option key={rfc.connectionName} value={rfc.connectionName}>
                  {rfc.connectionName}
                </option>
              ))}
            </Select>

            {/* RFC가 선택되어 있을 때만 테스트/삭제 버튼 표시 */}
            {settings.selectedRfc && (
              <>
                <Button
                  onClick={testRfcConnection}
                  style={{ marginRight: '10px' }}
                >
                  테스트
                </Button>
                <Button
                  onClick={() => deleteRfcConnection(settings.selectedRfc)}
                  style={{ marginRight: '10px' }}
                >
                  삭제
                </Button>
              </>
            )}
          </div>

          <div>
            <Label>연결 이름</Label>
            <Input
              value={newRfc.connectionName}
              onChange={(e) =>
                setNewRfc({ ...newRfc, connectionName: e.target.value })
              }
              placeholder="연결 이름 입력"
            />
            <Label>서버 호스트</Label>
            <Input
              value={newRfc.appServerHost}
              onChange={(e) =>
                setNewRfc({ ...newRfc, appServerHost: e.target.value })
              }
              placeholder="호스트 입력"
            />
            <Label>시스템 번호</Label>
            <Input
              value={newRfc.systemNumber}
              onChange={(e) =>
                setNewRfc({ ...newRfc, systemNumber: e.target.value })
              }
              placeholder="시스템 번호 입력"
            />
            <Label>시스템 ID</Label>
            <Input
              value={newRfc.systemID}
              onChange={(e) =>
                setNewRfc({ ...newRfc, systemID: e.target.value })
              }
              placeholder="시스템 ID 입력"
            />
            <Label>사용자</Label>
            <Input
              value={newRfc.user}
              onChange={(e) => setNewRfc({ ...newRfc, user: e.target.value })}
              placeholder="사용자 입력"
            />
            <Label>비밀번호</Label>
            <Input
              type="password"
              value={newRfc.password}
              onChange={(e) =>
                setNewRfc({ ...newRfc, password: e.target.value })
              }
              placeholder="비밀번호 입력"
            />
            <Label>클라이언트</Label>
            <Input
              value={newRfc.client}
              onChange={(e) => setNewRfc({ ...newRfc, client: e.target.value })}
              placeholder="클라이언트 입력"
            />
            <Label>언어</Label>
            <Input
              value={newRfc.language}
              onChange={(e) =>
                setNewRfc({ ...newRfc, language: e.target.value })
              }
              placeholder="언어 입력"
            />
            <Label>풀 크기</Label>
            <Input
              value={newRfc.poolSize}
              onChange={(e) =>
                setNewRfc({ ...newRfc, poolSize: e.target.value })
              }
              placeholder="풀 크기 입력"
            />
            <br />

            {/* RFC가 선택되어 있을 때만 수정 버튼 표시 */}
            {settings.selectedRfc && (
              <>
                <Button
                  onClick={addRfcConnection}
                  style={{ marginRight: '10px' }}
                >
                  RFC 연결 추가
                </Button>
                <Button onClick={updateRfcConnection}>수정</Button>
              </>
            )}
            {!settings.selectedRfc && (
              <>
                <Button onClick={addRfcConnection}>RFC 연결 추가</Button>
              </>
            )}
          </div>
        </Section>

        {/* ---------- DB 영역 ---------- */}
        <Section style={{ width: '800px', height: '300px' }}>
          <SectionTitle>DB 연결 설정</SectionTitle>
          <div>
            <Label>DB 선택</Label>
            <Select
              value={settings.selectedDbId}
              style={{ width: '200px', marginRight: '10px' }}
              onChange={(e) => handleDbSelect(e.target.value)}
            >
              <option value="">DB 선택</option>
              {settings.dbConnections.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.name}
                </option>
              ))}
            </Select>

            {/* DB가 선택되어 있을 때만 테스트/삭제 버튼 표시 */}
            {settings.selectedDbId && (
              <>
                <Button
                  onClick={testDbConnection}
                  style={{ marginRight: '10px' }}
                >
                  테스트
                </Button>
                <Button
                  onClick={() => deleteDbConnection(settings.selectedDbId)}
                  style={{ marginRight: '10px' }}
                >
                  삭제
                </Button>
              </>
            )}
          </div>

          <div>
            <Label>연결 이름</Label>
            <Input
              value={newDb.name}
              onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
              placeholder="연결 이름 입력"
            />
            <Label>호스트</Label>
            <Input
              value={newDb.host}
              onChange={(e) => setNewDb({ ...newDb, host: e.target.value })}
              placeholder="호스트 입력"
            />
            <Label>포트</Label>
            <Input
              value={newDb.port}
              onChange={(e) => setNewDb({ ...newDb, port: e.target.value })}
              placeholder="포트 입력"
            />
            <Label>SID</Label>
            <Input
              value={newDb.sid}
              onChange={(e) => setNewDb({ ...newDb, sid: e.target.value })}
              placeholder="SID 입력"
            />
            <Label>사용자</Label>
            <Input
              value={newDb.user}
              onChange={(e) => setNewDb({ ...newDb, user: e.target.value })}
              placeholder="사용자 입력"
            />
            <Label>비밀번호</Label>
            <Input
              type="password"
              value={newDb.password}
              onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
              placeholder="비밀번호 입력"
            />
            <br />

            {/* DB가 선택되어 있을 때만 수정 버튼 표시 */}
            {settings.selectedDbId && (
              <>
                <Button
                  onClick={addDbConnection}
                  style={{ marginRight: '10px' }}
                >
                  DB 연결 추가
                </Button>
                <Button onClick={updateDbConnection}>수정</Button>
              </>
            )}
            {!settings.selectedDbId && (
              <>
                <Button onClick={addDbConnection}>DB 연결 추가</Button>
              </>
            )}
          </div>
        </Section>

        {/* 메시지 출력 */}
        {message && (
          <FixedMessage
            color={
              message.includes('추가') ||
              message.includes('삭제') ||
              message.includes('수정') ||
              message.includes('테스트')
                ? '#4A90E2'
                : '#E41E1E'
            }
          >
            {message}
          </FixedMessage>
        )}
      </ContentContainer>
    </>
  );
}
