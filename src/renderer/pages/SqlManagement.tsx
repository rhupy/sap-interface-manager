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

import { format } from 'sql-formatter';

interface SqlInfo {
  id: string;
  name: string;
  description: string;
  sqlText: string;
  // 파라미터 리스트를 저장하고 싶다면 아래처럼 필드를 추가해도 됨.
  // params?: string[];
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

  // 추가) SQL 내 파라미터 목록을 추출해 보여주기 위한 state
  const [paramList, setParamList] = useState<string[]>([]);

  // -----------------------------
  // 1) 초기 로딩
  // -----------------------------
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

  // -----------------------------
  // 2) 자동 저장
  // -----------------------------
  useEffect(() => {
    if (!isInitialLoad && window.api?.saveSqlSettings) {
      window.api
        .saveSqlSettings(sqlSettings)
        .catch((err) => console.error('SQL 설정 저장 실패:', err));
    }
  }, [sqlSettings, isInitialLoad]);

  // -----------------------------
  // 3) selectedSqlId -> newSql
  // -----------------------------
  useEffect(() => {
    if (!sqlSettings.selectedSqlId) {
      setNewSql(emptySqlInfo);
      setParamList([]);
      return;
    }
    const found = sqlSettings.sqlList.find(
      (sql) => sql.id === sqlSettings.selectedSqlId
    );
    if (found) {
      setNewSql(found);
      // SQL 텍스트에서 파라미터 추출하여 표시
      const extracted = extractParamsFromSql(found.sqlText);
      setParamList(extracted);
    } else {
      setNewSql(emptySqlInfo);
      setParamList([]);
    }
  }, [sqlSettings.selectedSqlId, sqlSettings.sqlList]);

  // -----------------------------
  // 파라미터 추출 (정규식)
  // 예: ::파라미터 형태를 인식
  // -----------------------------
  function extractParamsFromSql(sqlText: string) {
    // "::" 뒤에 알파벳·숫자·언더스코어 등을 파라미터명으로 인식
    // 예) ::PARAM_1 → PARAM_1
    const regex = /::([A-Za-z0-9_]+)/g;
    const results: string[] = [];
    let match;
    while ((match = regex.exec(sqlText)) !== null) {
      results.push(match[1]); // match[1]이 그룹 1(파라미터명)
    }
    return results;
  }

  // -----------------------------
  // SQL 정렬 (sql-formatter)
  // -----------------------------
  const handleFormatSql = () => {
    if (!newSql.sqlText.trim()) {
      setMessage('SQL 문이 비어 있습니다.');
      return;
    }
    try {
      // 기본 옵션
      const formatted = format(newSql.sqlText, {
        language: 'sql',
        keywordCase: 'upper',
        indentStyle: 'standard',
        tabWidth: 2,
      });

      // 정렬된 SQL로 업데이트
      setNewSql({ ...newSql, sqlText: formatted });

      // 파라미터 다시 추출
      const extracted = extractParamsFromSql(formatted);
      setParamList(extracted);

      setMessage('SQL이 정렬되었습니다.');
    } catch (error) {
      console.error('SQL 정렬 오류:', error);
      setMessage('SQL 정렬 중 오류가 발생했습니다.');
    }
  };

  // (좌측 목록 선택)
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

  // (SQL문 입력할 때마다 파라미터 리스트 다시 추출)
  const handleSqlTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNewSql({ ...newSql, sqlText: newText });
    // 입력 중에도 실시간 파라미터 추출
    const extracted = extractParamsFromSql(newText);
    setParamList(extracted);
  };

  if (isInitialLoad) {
    return <div>SQL 설정을 불러오는 중...</div>;
  }

  // 리스트 정렬(예시): 생성순, 이름순 등은 향후 확장
  // 여기서는 간단히 “이름 오름차순” 정렬 예시
  const sortedSqlList = [...sqlSettings.sqlList].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <Title>SQL 관리</Title>
      <Description>등록된 SQL 목록 및 수정/추가/삭제 기능</Description>

      <div style={{ display: 'flex' }}>
        {/* 왼쪽 목록 (정렬된 목록 표시) */}
        <div style={{ width: '300px', marginRight: '20px' }}>
          <SectionTitle>SQL 목록 (이름순 정렬)</SectionTitle>
          <div style={{ overflowY: 'auto' }}>
            {sortedSqlList.map((item) => (
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

        {/* 오른쪽: 상세/수정/추가 */}
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
            onChange={handleSqlTextChange}
            placeholder="SELECT * FROM ..."
          />

          {/* 파라미터 목록 표시 */}
          {paramList.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <SectionTitle>파라미터 목록</SectionTitle>
              <ul style={{ paddingLeft: '20px' }}>
                {paramList.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            {/* 선택된 SQL이 없으면 '추가' 버튼만 */}
            {!sqlSettings.selectedSqlId && (
              <Button onClick={handleAddSql} style={{ marginRight: '5px' }}>
                추가
              </Button>
            )}

            {/* 선택된 SQL이 있으면 수정/삭제 */}
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
              </>
            )}

            {/* SQL 정렬 버튼 */}
            <Button onClick={handleFormatSql} style={{ marginRight: '5px' }}>
              정렬
            </Button>
          </div>
        </Section>
      </div>

      {message && (
        <FixedMessage
          color={
            message.includes('추가') ||
            message.includes('삭제') ||
            message.includes('수정') ||
            message.includes('정렬')
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
