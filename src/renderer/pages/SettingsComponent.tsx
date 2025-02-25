// src/renderer/pages/SettingsComponent.tsx
import React, { useState, useEffect } from 'react';
import {
  AppContainer,
  TabContainer,
  TabButton,
  ContentContainer,
  Title,
  Description,
  Button,
  Input,
  Select,
  Label,
  Message,
  Section,
  SectionTitle,
} from '../styles/CommonStyles';
import {
  RfcConnectionInfo,
  DbConnectionConfig,
  Settings,
} from '../types/index';

// preload.ts에서 노출된 API 사용을 위한 타입 정의 (옵셔널로 수정)
declare global {
  interface Window {
    api?: {
      saveSettings: (settings: any) => Promise<void>;
      loadSettings: () => Promise<Settings | null>;
    };
  }
}

const initialSettings: Settings = {
  rfcList: [],
  dbConnections: [],
  selectedRfc: '', // 선택된 RFC 연결 이름
  selectedDbId: '', // 선택된 DB 연결 ID
};

export default function SettingsComponent() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [newRfc, setNewRfc] = useState<RfcConnectionInfo>({
    connectionName: '',
    appServerHost: '',
    systemNumber: '',
    systemID: '',
    user: '',
    password: '',
    client: '',
    language: '',
    poolSize: '',
  });
  const [newDb, setNewDb] = useState<DbConnectionConfig>({
    id: '',
    name: '',
    host: '',
    port: '',
    sid: '',
    user: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (window.api) {
      window.api
        .loadSettings()
        .then((savedSettings: Settings | null) => {
          setSettings(savedSettings || initialSettings);
        })
        .catch((error) => console.error('설정 불러오기 실패:', error));
    } else {
      console.warn('window.api가 정의되지 않았습니다. 기본 설정을 사용합니다.');
      setSettings(initialSettings); // 기본값으로 설정
    }
  }, []);

  useEffect(() => {
    if (window.api) {
      window.api
        .saveSettings(settings)
        .catch((error) => console.error('설정 저장 실패:', error));
    } else {
      console.warn('window.api가 정의되지 않았습니다. 설정 저장을 생략합니다.');
    }
  }, [settings]);

  const addRfcConnection = () => {
    if (newRfc.connectionName && newRfc.appServerHost) {
      setSettings({
        ...settings,
        rfcList: [...settings.rfcList, newRfc],
      });
      setNewRfc({
        connectionName: '',
        appServerHost: '',
        systemNumber: '',
        systemID: '',
        user: '',
        password: '',
        client: '',
        language: '',
        poolSize: '',
      });
      setMessage('RFC 연결이 추가되었습니다.');
    } else {
      setMessage('연결 이름과 호스트를 입력하세요.');
    }
  };

  const addDbConnection = () => {
    if (newDb.name && newDb.host) {
      const newId = `db-${Date.now()}`;
      setSettings({
        ...settings,
        dbConnections: [...settings.dbConnections, { ...newDb, id: newId }],
      });
      setNewDb({
        id: '',
        name: '',
        host: '',
        port: '',
        sid: '',
        user: '',
        password: '',
      });
      setMessage('DB 연결이 추가되었습니다.');
    } else {
      setMessage('연결 이름과 호스트를 입력하세요.');
    }
  };

  const deleteRfcConnection = (connectionName: string) => {
    setSettings({
      ...settings,
      rfcList: settings.rfcList.filter(
        (rfc) => rfc.connectionName !== connectionName
      ),
      selectedRfc:
        settings.selectedRfc === connectionName ? '' : settings.selectedRfc, // 선택 해제
    });
    setMessage('RFC 연결이 삭제되었습니다.');
  };

  const deleteDbConnection = (id: string) => {
    setSettings({
      ...settings,
      dbConnections: settings.dbConnections.filter((db) => db.id !== id),
      selectedDbId: settings.selectedDbId === id ? '' : settings.selectedDbId, // 선택 해제
    });
    setMessage('DB 연결이 삭제되었습니다.');
  };

  // RFC 선택 처리
  const handleRfcSelect = (connectionName: string) => {
    setSettings({
      ...settings,
      selectedRfc: connectionName,
    });
    setMessage(`RFC "${connectionName}"이 선택되었습니다.`);
  };

  // DB 선택 처리
  const handleDbSelect = (id: string) => {
    setSettings({
      ...settings,
      selectedDbId: id,
    });
    setMessage(
      `DB "${settings.dbConnections.find((db) => db.id === id)?.name}"이 선택되었습니다.`
    );
  };

  // RFC 테스트 (플레이스홀더, 나중에 구현)
  const testRfcConnection = () => {
    if (settings.selectedRfc) {
      const rfc = settings.rfcList.find(
        (r) => r.connectionName === settings.selectedRfc
      );
      if (rfc) {
        setMessage(`RFC "${rfc.connectionName}" 테스트 (미구현)`);
      } else {
        setMessage('선택된 RFC 연결이 없습니다.');
      }
    } else {
      setMessage('RFC 연결을 선택하세요.');
    }
  };

  // DB 테스트 (플레이스홀더, 나중에 구현)
  const testDbConnection = () => {
    if (settings.selectedDbId) {
      const db = settings.dbConnections.find(
        (d) => d.id === settings.selectedDbId
      );
      if (db) {
        setMessage(`DB "${db.name}" 테스트 (미구현)`);
      } else {
        setMessage('선택된 DB 연결이 없습니다.');
      }
    } else {
      setMessage('DB 연결을 선택하세요.');
    }
  };

  return (
    <>
      <Title>환경 설정</Title>
      <Description>RFC 및 DB 연결 설정을 관리하세요.</Description>

      <ContentContainer>
        <Section>
          <SectionTitle>RFC 연결 설정</SectionTitle>
          <div style={{ marginTop: '20px' }}>
            {' '}
            {/* 간격 추가로 레이아웃 개선 */}
            <Label>RFC 선택</Label>
            <Select
              value={settings.selectedRfc}
              onChange={(e) => handleRfcSelect(e.target.value)}
              style={{ width: '200px', marginRight: '10px' }} // 스타일 추가
            >
              <option value="">RFC 선택</option>
              {settings.rfcList.map((rfc) => (
                <option key={rfc.connectionName} value={rfc.connectionName}>
                  {rfc.connectionName}
                </option>
              ))}
            </Select>
            <Button onClick={testRfcConnection} style={{ marginRight: '10px' }}>
              테스트
            </Button>
            <Button
              onClick={() =>
                settings.selectedRfc &&
                deleteRfcConnection(settings.selectedRfc)
              }
              style={{ marginRight: '10px' }}
            >
              삭제
            </Button>
            <Button
              onClick={() =>
                settings.selectedRfc && handleRfcSelect(settings.selectedRfc)
              }
            >
              선택
            </Button>
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
            <Label>애플리케이션 서버 호스트</Label>
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
            <Button onClick={addRfcConnection}>RFC 연결 추가</Button>
          </div>
        </Section>

        <Section>
          <SectionTitle>DB 연결 설정</SectionTitle>
          <div style={{ marginTop: '20px' }}>
            {' '}
            {/* 간격 추가로 레이아웃 개선 */}
            <Label>DB 선택</Label>
            <Select
              value={settings.selectedDbId}
              onChange={(e) => handleDbSelect(e.target.value)}
              style={{ width: '200px', marginRight: '10px' }} // 스타일 추가
            >
              <option value="">DB 선택</option>
              {settings.dbConnections.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.name}
                </option>
              ))}
            </Select>
            <Button onClick={testDbConnection} style={{ marginRight: '10px' }}>
              테스트
            </Button>
            <Button
              onClick={() =>
                settings.selectedDbId &&
                deleteDbConnection(settings.selectedDbId)
              }
              style={{ marginRight: '10px' }}
            >
              삭제
            </Button>
            <Button
              onClick={() =>
                settings.selectedDbId && handleDbSelect(settings.selectedDbId)
              }
            >
              선택
            </Button>
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
            <Button onClick={addDbConnection}>DB 연결 추가</Button>
          </div>
        </Section>

        {message && (
          <Message
            color={
              message.includes('추가') ||
              message.includes('삭제') ||
              message.includes('선택')
                ? '#4A90E2'
                : '#E41E1E'
            }
          >
            {message}
          </Message>
        )}
      </ContentContainer>
    </>
  );
}
