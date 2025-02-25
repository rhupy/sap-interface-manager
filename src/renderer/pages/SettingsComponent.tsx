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

// preload.ts에서 노출된 API 사용을 위한 타입 정의
declare global {
  interface Window {
    api: {
      saveSettings: (settings: any) => Promise<void>;
      loadSettings: () => Promise<Settings | null>;
    };
  }
}

const initialSettings: Settings = {
  rfcList: [],
  dbConnections: [],
  selectedRfc: '',
  selectedDbId: '',
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
    window.api
      .loadSettings()
      .then((savedSettings: Settings | null) => {
        setSettings(savedSettings || initialSettings);
      })
      .catch((error) => console.error('설정 불러오기 실패:', error));
  }, []);

  useEffect(() => {
    window.api
      .saveSettings(settings)
      .catch((error) => console.error('설정 저장 실패:', error));
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
    });
    setMessage('RFC 연결이 삭제되었습니다.');
  };

  const deleteDbConnection = (id: string) => {
    setSettings({
      ...settings,
      dbConnections: settings.dbConnections.filter((db) => db.id !== id),
    });
    setMessage('DB 연결이 삭제되었습니다.');
  };

  return (
    <>
      <Title>환경 설정</Title>
      <Description>RFC 및 DB 연결 설정을 관리하세요.</Description>

      <ContentContainer>
        <Section>
          <SectionTitle>RFC 연결 설정</SectionTitle>
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
          <div>
            {settings.rfcList.map((rfc) => (
              <div key={rfc.connectionName}>
                {rfc.connectionName} - {rfc.appServerHost}
                <Button onClick={() => deleteRfcConnection(rfc.connectionName)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionTitle>DB 연결 설정</SectionTitle>
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
          <div>
            {settings.dbConnections.map((db) => (
              <div key={db.id}>
                {db.name} - {db.host}
                <Button onClick={() => deleteDbConnection(db.id)}>삭제</Button>
              </div>
            ))}
          </div>
        </Section>

        {message && (
          <Message
            color={
              message.includes('추가') || message.includes('삭제')
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
