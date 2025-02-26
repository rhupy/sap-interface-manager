// src/renderer/pages/SqlManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Section,
  SectionTitle,
  Label,
  Input,
  Button,
  Title,
  Description,
  FixedMessage,
  FlexContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  ListItem,
  MainPanel,
  TextArea,
  ButtonGroup,
  SelectGroup,
  SmallLabel,
  SmallSelect,
  MetaInfo,
  FullPageContainer,
  DeleteButton,
  LeftAlignedLabel,
} from '../styles/CommonStyles';

import { format } from 'sql-formatter';
import { useSettingsContext } from '../context/SettingContext';
import { SqlInfo } from '../types';

const emptySqlInfo: SqlInfo = {
  id: '',
  name: '',
  description: '',
  sqlText: '',
  createdAt: '',
  updatedAt: '',
  parameters: [],
};

// 정렬 타입 정의
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function SqlManagement() {
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const [message, setMessage] = useState('');
  const [newSql, setNewSql] = useState<SqlInfo>(emptySqlInfo);
  const [paramList, setParamList] = useState<string[]>([]);

  // 정렬 상태 추가
  const [sortType, setSortType] = useState<SortType>('name');

  // -----------------------------
  // 3) selectedSqlId -> newSql
  // -----------------------------
  useEffect(() => {
    if (!settings.selectedSqlId) {
      setNewSql(emptySqlInfo);
      setParamList([]);
      return;
    }

    // settings.sqlList가 없을 경우 빈 배열로 처리
    const sqlList = settings.sqlList || [];

    const found = sqlList.find((sql) => sql.id === settings.selectedSqlId);
    if (found) {
      setNewSql(found);
      // 저장된 파라미터가 있으면 사용, 없으면 추출
      if (found.parameters && found.parameters.length > 0) {
        setParamList(found.parameters);
      } else {
        // SQL 텍스트에서 파라미터 추출하여 표시
        const extracted = extractParamsFromSql(found.sqlText);
        setParamList(extracted);
      }
    } else {
      setNewSql(emptySqlInfo);
      setParamList([]);
    }
  }, [settings.selectedSqlId, settings.sqlList]);

  // -----------------------------
  // 파라미터 추출 (정규식)
  // -----------------------------
  function extractParamsFromSql(sqlText: string) {
    const regex = /::([A-Za-z0-9_]+)/g;
    const results: string[] = [];
    let match;
    while ((match = regex.exec(sqlText)) !== null) {
      // 중복 제거
      if (!results.includes(match[1])) {
        results.push(match[1]);
      }
    }
    return results;
  }

  // -----------------------------
  // 현재 시간 포맷팅 함수
  // -----------------------------
  function getCurrentFormattedTime() {
    const now = new Date();
    return now.toISOString();
  }

  // -----------------------------
  // 시간 표시 포맷팅 함수
  // -----------------------------
  function formatDateTime(isoString: string) {
    if (!isoString) return '';

    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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
      // 파라미터를 임시 문자열로 변환 (::param -> '__PARAM__param') : 파라미터가 포함된 경우 정렬 오류때문
      const paramPlaceholderRegex = /::([A-Za-z0-9_]+)/g;
      const tempSql = newSql.sqlText.replace(
        paramPlaceholderRegex,
        "'__PARAM__$1'"
      );

      // SQL 포맷팅
      const formatted = format(tempSql, {
        language: 'sql',
        keywordCase: 'upper',
        indentStyle: 'standard',
        tabWidth: 2,
      });

      // 임시 문자열을 다시 파라미터로 변환 ('__PARAM__param' -> ::param)
      const restoredSql = formatted.replace(
        /'__PARAM__([A-Za-z0-9_]+)'/g,
        '::$1'
      );

      setNewSql({ ...newSql, sqlText: restoredSql });
      const extracted = extractParamsFromSql(restoredSql);
      setParamList(extracted);
      setMessage('SQL이 정렬되었습니다.');
    } catch (error) {
      console.error('SQL 정렬 오류:', error);
      setMessage('SQL 정렬 중 오류가 발생했습니다.');
    }
  };

  // (좌측 목록 선택)
  const handleSelectSql = (id: string) => {
    updateSettings({ selectedSqlId: id });
  };

  // (추가)
  const handleAddSql = () => {
    if (!newSql.name) {
      setMessage('SQL명을 입력하세요.');
      return;
    }

    const sqlList = settings.sqlList || [];

    const isDuplicate = sqlList.some((item) => item.name === newSql.name);
    if (isDuplicate) {
      setMessage('이미 존재하는 SQL명입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();
    const parameters = extractParamsFromSql(newSql.sqlText);

    const newId = `sql-${Date.now()}`;
    const newItem: SqlInfo = {
      ...newSql,
      id: newId,
      createdAt: currentTime,
      updatedAt: currentTime,
      parameters: parameters,
    };

    updateSettings((prev) => ({
      ...prev,
      sqlList: [...(prev.sqlList || []), newItem],
      selectedSqlId: newId,
    }));

    setMessage('SQL이 추가되었습니다.');
  };

  // (수정)
  const handleUpdateSql = () => {
    if (!settings.selectedSqlId) {
      setMessage('수정할 SQL이 선택되지 않았습니다.');
      return;
    }
    if (!newSql.name) {
      setMessage('SQL명을 입력하세요.');
      return;
    }

    const sqlList = settings.sqlList || [];

    const isDuplicate = sqlList.some(
      (item) => item.name === newSql.name && item.id !== settings.selectedSqlId
    );
    if (isDuplicate) {
      setMessage('이미 존재하는 SQL명입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();
    const parameters = extractParamsFromSql(newSql.sqlText);

    updateSettings((prev) => ({
      ...prev,
      sqlList: (prev.sqlList || []).map((item) =>
        item.id === settings.selectedSqlId
          ? {
              ...item,
              ...newSql,
              updatedAt: currentTime,
              parameters: parameters,
            }
          : item
      ),
    }));

    setMessage('SQL이 수정되었습니다.');
  };

  // (삭제)
  const handleDeleteSql = () => {
    if (!settings.selectedSqlId) {
      setMessage('삭제할 SQL이 선택되지 않았습니다.');
      return;
    }

    updateSettings((prev) => ({
      ...prev,
      sqlList: (prev.sqlList || []).filter(
        (item) => item.id !== settings.selectedSqlId
      ),
      selectedSqlId: '',
    }));

    setMessage('SQL이 삭제되었습니다.');
  };

  // (SQL문 입력할 때마다 파라미터 리스트 다시 추출)
  const handleSqlTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNewSql({ ...newSql, sqlText: newText });
    const extracted = extractParamsFromSql(newText);
    setParamList(extracted);
  };

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value as SortType);
  };

  if (isLoading) {
    return <div>SQL 설정을 불러오는 중...</div>;
  }

  // SQL 목록 정렬
  const sortedSqlList = [...(settings.sqlList || [])].sort((a, b) => {
    switch (sortType) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'createdAt':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'updatedAt':
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <FullPageContainer>
      <Title>SQL 관리</Title>
      <Description>등록된 SQL 목록 및 수정/추가/삭제 기능</Description>

      <FlexContainer>
        {/* 왼쪽 SQL 목록 패널 */}
        <SidePanel>
          <SidePanelHeader>
            <SelectGroup>
              <SmallLabel>정렬:</SmallLabel>
              <SmallSelect value={sortType} onChange={handleSortTypeChange}>
                <option value="name">이름순</option>
                <option value="createdAt">생성시간순</option>
                <option value="updatedAt">수정시간순</option>
              </SmallSelect>
            </SelectGroup>
          </SidePanelHeader>

          <SidePanelContent>
            {sortedSqlList.length === 0 ? (
              <div
                style={{ padding: '15px', textAlign: 'center', color: '#999' }}
              >
                등록된 SQL이 없습니다.
              </div>
            ) : (
              sortedSqlList.map((item) => (
                <ListItem
                  key={item.id}
                  active={item.id === settings.selectedSqlId}
                  onClick={() => handleSelectSql(item.id)}
                >
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#777' }}>
                    {item.description.slice(0, 30)}
                    {item.description.length > 30 ? '...' : ''}
                  </div>
                  <MetaInfo>
                    {sortType === 'name' ? (
                      <>생성: {formatDateTime(item.createdAt)}</>
                    ) : sortType === 'createdAt' ? (
                      <>생성: {formatDateTime(item.createdAt)}</>
                    ) : (
                      <>수정: {formatDateTime(item.updatedAt)}</>
                    )}
                  </MetaInfo>
                </ListItem>
              ))
            )}
          </SidePanelContent>
        </SidePanel>

        {/* 오른쪽 SQL 정보 패널 */}
        <MainPanel>
          <Section>
            <SectionTitle>SQL 정보</SectionTitle>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>SQL 명</LeftAlignedLabel>
                <Input
                  value={newSql.name}
                  onChange={(e) =>
                    setNewSql({ ...newSql, name: e.target.value })
                  }
                  placeholder="예) CUSTOMER_SELECT"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>설명</LeftAlignedLabel>
                <Input
                  value={newSql.description}
                  onChange={(e) =>
                    setNewSql({ ...newSql, description: e.target.value })
                  }
                  placeholder="SQL에 대한 간단한 설명"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            </div>

            {/* 생성/수정 시간 표시 */}
            {newSql.createdAt && (
              <div
                style={{
                  marginBottom: '5px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                <div>생성: {formatDateTime(newSql.createdAt)}</div>
                {newSql.updatedAt && newSql.updatedAt !== newSql.createdAt && (
                  <div>수정: {formatDateTime(newSql.updatedAt)}</div>
                )}
              </div>
            )}

            <LeftAlignedLabel>SQL 문</LeftAlignedLabel>
            <TextArea
              value={newSql.sqlText}
              onChange={handleSqlTextChange}
              placeholder="SELECT * FROM ..."
            />

            {/* 파라미터 목록 표시 */}
            {paramList.length > 0 && (
              <div style={{ margin: '10px 0' }}>
                <SectionTitle>
                  파라미터 목록 ({paramList.length}개)
                </SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {paramList.map((p) => (
                    <div
                      key={p}
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ButtonGroup>
              {/* 선택된 SQL이 없으면 '추가' 버튼만 */}
              {!settings.selectedSqlId ? (
                <Button onClick={handleAddSql}>새 SQL 추가</Button>
              ) : (
                <>
                  <Button onClick={handleAddSql}>새 SQL 추가</Button>
                  <Button onClick={handleFormatSql}>SQL 정렬</Button>
                  <Button onClick={handleUpdateSql}>수정</Button>
                  <DeleteButton onClick={handleDeleteSql}>삭제</DeleteButton>
                </>
              )}
            </ButtonGroup>
          </Section>
        </MainPanel>
      </FlexContainer>

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
    </FullPageContainer>
  );
}
