// src/renderer/pages/SqlManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Section,
  SectionTitle,
  Label,
  Input,
  Button,
  Message,
  Title,
  Description,
  FixedMessage,
} from '../styles/CommonStyles';

interface SqlInfo {
  id: string;
  name: string;
  description: string;
  sqlText: string;
}

interface SqlSettings {
  sqlList: SqlInfo[];
  selectedSqlId: string;
}

const initialSqlSettings: SqlSettings = {
  sqlList: [],
  selectedSqlId: '',
};

const emptySqlInfo: SqlInfo = {
  id: '',
  name: '',
  description: '',
  sqlText: '',
};

export default function SqlManagement() {
  const [sqlSettings, setSqlSettings] =
    useState<SqlSettings>(initialSqlSettings);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState('');
  const [newSql, setNewSql] = useState<SqlInfo>(emptySqlInfo);

  // 1) 초기 로딩
  useEffect(() => {
    if (window.api?.loadSqlSettings) {
      window.api
        .loadSqlSettings()
        .then((saved) => {
          setSqlSettings(saved || initialSqlSettings);
        })
        .catch((err) => console.error('SQL 설정 불러오기 실패:', err))
        .finally(() => setIsInitialLoad(false));
    } else {
      setIsInitialLoad(false);
    }
  }, []);

  // 2) 자동 저장
  useEffect(() => {
    if (!isInitialLoad && window.api?.saveSqlSettings) {
      window.api
        .saveSqlSettings(sqlSettings)
        .catch((err) => console.error('SQL 설정 저장 실패:', err));
    }
  }, [sqlSettings, isInitialLoad]);

  // 3) selectedSqlId -> newSql 반영
  useEffect(() => {
    if (!sqlSettings.selectedSqlId) {
      setNewSql(emptySqlInfo);
      return;
    }
    const found = sqlSettings.sqlList.find(
      (sql) => sql.id === sqlSettings.selectedSqlId
    );
    setNewSql(found || emptySqlInfo);
  }, [sqlSettings.selectedSqlId, sqlSettings.sqlList]);

  // (좌측 목록에서 선택)
  const handleSelectSql = (id: string) => {
    setSqlSettings({ ...sqlSettings, selectedSqlId: id });
  };

  // (추가)
  const handleAddSql = () => {
    if (!newSql.name) {
      setMessage('SQL명을 입력하세요.');
      return;
    }
    const isDuplicate = sqlSettings.sqlList.some(
      (item) => item.name === newSql.name
    );
    if (isDuplicate) {
      setMessage('이미 존재하는 SQL명입니다.');
      return;
    }
    const newId = `sql-${Date.now()}`;
    const newItem: SqlInfo = { ...newSql, id: newId };
    setSqlSettings({
      ...sqlSettings,
      sqlList: [...sqlSettings.sqlList, newItem],
      selectedSqlId: newId,
    });
    setMessage('SQL이 추가되었습니다.');
  };

  // (수정)
  const handleUpdateSql = () => {
    if (!sqlSettings.selectedSqlId) {
      setMessage('수정할 SQL이 선택되지 않았습니다.');
      return;
    }
    if (!newSql.name) {
      setMessage('SQL명을 입력하세요.');
      return;
    }
    const isDuplicate = sqlSettings.sqlList.some(
      (item) =>
        item.name === newSql.name && item.id !== sqlSettings.selectedSqlId
    );
    if (isDuplicate) {
      setMessage('이미 존재하는 SQL명입니다.');
      return;
    }
    setSqlSettings({
      ...sqlSettings,
      sqlList: sqlSettings.sqlList.map((item) =>
        item.id === sqlSettings.selectedSqlId ? { ...item, ...newSql } : item
      ),
    });
    setMessage('SQL이 수정되었습니다.');
  };

  // (삭제)
  const handleDeleteSql = () => {
    if (!sqlSettings.selectedSqlId) {
      setMessage('삭제할 SQL이 선택되지 않았습니다.');
      return;
    }
    setSqlSettings({
      ...sqlSettings,
      sqlList: sqlSettings.sqlList.filter(
        (item) => item.id !== sqlSettings.selectedSqlId
      ),
      selectedSqlId: '',
    });
    setMessage('SQL이 삭제되었습니다.');
  };

  // (테스트 - 미구현)
  const handleTestSql = () => {
    if (!newSql.sqlText.trim()) {
      setMessage('SQL 문이 없습니다.');
      return;
    }
    setMessage(`SQL 테스트(미구현) : \n${newSql.sqlText}`);
  };

  if (isInitialLoad) {
    return <div>SQL 설정을 불러오는 중...</div>;
  }

  return (
    <>
      <Title>SQL 관리</Title>
      <Description>등록된 SQL 목록 및 수정/추가/삭제 기능</Description>

      <div style={{ display: 'flex' }}>
        {/* 왼쪽 목록 */}
        <div style={{ width: '300px', marginRight: '20px' }}>
          <SectionTitle>SQL 목록</SectionTitle>
          <div style={{ overflowY: 'auto' }}>
            {sqlSettings.sqlList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '8px',
                  margin: '5px 0',
                  backgroundColor:
                    item.id === sqlSettings.selectedSqlId
                      ? '#cce4f7'
                      : '#f0f0f0',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelectSql(item.id)}
              >
                <strong>{item.name}</strong>
                <br />
                <span style={{ fontSize: '0.9rem', color: '#777' }}>
                  {item.description.slice(0, 20)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 상세/수정/추가 */}
        <Section style={{ flex: 1 }}>
          <SectionTitle>SQL 정보</SectionTitle>

          <Label>SQL 명</Label>
          <Input
            value={newSql.name}
            onChange={(e) => setNewSql({ ...newSql, name: e.target.value })}
            placeholder="예) CUSTOMER_SELECT"
          />

          <Label>설명</Label>
          <Input
            value={newSql.description}
            onChange={(e) =>
              setNewSql({ ...newSql, description: e.target.value })
            }
            placeholder="SQL에 대한 간단한 설명"
          />

          <Label>SQL 문</Label>
          <textarea
            style={{
              width: '100%',
              height: '150px',
              margin: '5px 0',
              padding: '8px',
              resize: 'vertical',
            }}
            value={newSql.sqlText}
            onChange={(e) => setNewSql({ ...newSql, sqlText: e.target.value })}
            placeholder="SELECT * FROM ..."
          />

          <div style={{ marginTop: '10px' }}>
            {/* 선택된 SQL이 없으면 '추가' 버튼만 노출 */}
            {!sqlSettings.selectedSqlId && (
              <Button onClick={handleAddSql} style={{ marginRight: '5px' }}>
                추가
              </Button>
            )}

            {/* 선택된 SQL이 있으면 수정/삭제/테스트 */}
            {sqlSettings.selectedSqlId && (
              <>
                <Button onClick={handleAddSql} style={{ marginRight: '5px' }}>
                  새 SQL 추가
                </Button>
                <Button
                  onClick={handleUpdateSql}
                  style={{ marginRight: '5px' }}
                >
                  수정
                </Button>
                <Button
                  onClick={handleDeleteSql}
                  style={{ marginRight: '5px' }}
                >
                  삭제
                </Button>
                <Button onClick={handleTestSql} style={{ marginRight: '5px' }}>
                  테스트 (미구현)
                </Button>
              </>
            )}
          </div>
        </Section>
      </div>

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
    </>
  );
}
