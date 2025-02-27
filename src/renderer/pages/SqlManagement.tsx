// src/renderer/pages/SqlManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Section,
  SectionTitle,
  Input,
  Button,
  Title,
  Description,
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
import { useMessage } from '../context/MessageContext';
import { SqlInfo } from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';

const emptySqlInfo: SqlInfo = {
  id: '',
  name: '',
  description: '',
  sqlText: '',
  createdAt: '',
  updatedAt: '',
  parameters: [],
};

// 커스텀 CSS 스타일
const customStyles = `
  .token.parameter {
    color: #e74c3c !important;
    font-weight: bold !important;
  }
`;

// 정렬 타입 정의
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function SqlManagement() {
  const { showMessage } = useMessage();

  const [searchTerm, setSearchTerm] = useState('');

  const [showHighlighter, setShowHighlighter] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { settings, updateSettings, isLoading } = useSettingsContext();
  const [newSql, setNewSql] = useState<SqlInfo>(emptySqlInfo);
  const [paramList, setParamList] = useState<string[]>([]);

  // 정렬 상태 추가
  const [sortType, setSortType] = useState<SortType>('name');

  // 정렬 및 검색 적용된 SQL 목록
  const filteredAndSortedSqlList = React.useMemo(() => {
    // 검색어로 필터링
    const filtered = (settings.sqlList || []).filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 적용
    return [...filtered].sort((a, b) => {
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
  }, [settings.sqlList, searchTerm, sortType]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 구문 강조 적용
  useEffect(() => {
    if (showHighlighter) {
      // 파라미터 강조를 위한 커스텀 토큰 추가
      if (!(Prism.languages.sql as any).parameter) {
        (Prism.languages.sql as any).parameter = {
          pattern: /::([A-Za-z0-9_]+)/g,
          greedy: true,
        };
      }

      // 구문 강조 적용
      Prism.highlightAll();
    }
  }, [showHighlighter, newSql.sqlText]);

  // 커스텀 스타일 적용
  useEffect(() => {
    // 스타일 요소가 이미 있는지 확인
    const existingStyle = document.getElementById('prism-custom-styles');
    if (!existingStyle) {
      // 새 스타일 요소 생성 및 추가
      const styleElement = document.createElement('style');
      styleElement.id = 'prism-custom-styles';
      styleElement.textContent = customStyles;
      document.head.appendChild(styleElement);
    }

    return () => {
      // 컴포넌트 언마운트 시 스타일 제거
      const styleElement = document.getElementById('prism-custom-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // 구문 강조 토글
  const toggleHighlighter = () => {
    setShowHighlighter(!showHighlighter);
  };

  // 텍스트 영역 포커스 처리
  const handleTextAreaFocus = () => {
    setShowHighlighter(false);
  };

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
      showMessage('SQL 문이 비어 있습니다.');
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
      showMessage('SQL이 정렬되었습니다.', 'success');
    } catch (error) {
      console.error('SQL 정렬 오류:', error);
      showMessage('SQL 정렬 중 오류가 발생했습니다.', 'error');
    }
  };

  // (좌측 목록 선택)
  const handleSelectSql = (id: string) => {
    updateSettings({ selectedSqlId: id });
  };

  // (추가)
  const handleAddSql = () => {
    if (!newSql.name) {
      showMessage('SQL명을 입력하세요.');
      return;
    }

    const sqlList = settings.sqlList || [];

    const isDuplicate = sqlList.some((item) => item.name === newSql.name);
    if (isDuplicate) {
      showMessage('이미 존재하는 SQL명입니다.', 'error');
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

    showMessage('SQL이 추가되었습니다.');
  };

  // (수정)
  const handleUpdateSql = () => {
    if (!settings.selectedSqlId) {
      showMessage('수정할 SQL이 선택되지 않았습니다.');
      return;
    }
    if (!newSql.name) {
      showMessage('SQL명을 입력하세요.');
      return;
    }

    const sqlList = settings.sqlList || [];

    const isDuplicate = sqlList.some(
      (item) => item.name === newSql.name && item.id !== settings.selectedSqlId
    );
    if (isDuplicate) {
      showMessage('이미 존재하는 SQL명입니다.', 'error');
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

    showMessage('SQL이 수정되었습니다.', 'success');
  };

  // (삭제)
  const handleDeleteSql = () => {
    if (!settings.selectedSqlId) {
      showMessage('삭제할 SQL이 선택되지 않았습니다.');
      return;
    }

    updateSettings((prev) => ({
      ...prev,
      sqlList: (prev.sqlList || []).filter(
        (item) => item.id !== settings.selectedSqlId
      ),
      selectedSqlId: '',
    }));

    showMessage('SQL이 삭제되었습니다.', 'success');
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <SelectGroup style={{ marginBottom: 0 }}>
                <SmallLabel>정렬:</SmallLabel>
                <SmallSelect value={sortType} onChange={handleSortTypeChange}>
                  <option value="name">이름순</option>
                  <option value="createdAt">생성시간순</option>
                  <option value="updatedAt">수정시간순</option>
                </SmallSelect>
              </SelectGroup>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="검색..."
                  style={{
                    width: '120px',
                    padding: '5px',
                    fontSize: '0.9rem',
                    height: '28px',
                    marginBottom: 0,
                  }}
                />
              </div>
            </div>
          </SidePanelHeader>

          <SidePanelContent>
            {filteredAndSortedSqlList.length === 0 ? (
              <div
                style={{ padding: '15px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 SQL이 없습니다.'}
              </div>
            ) : (
              filteredAndSortedSqlList.map((item) => (
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
                <LeftAlignedLabel>타이틀</LeftAlignedLabel>
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
            <div style={{ position: 'relative', flex: 1, minHeight: '150px' }}>
              {showHighlighter ? (
                <div
                  onClick={() => setShowHighlighter(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'text',
                    backgroundColor: 'white',
                    padding: '10px',
                  }}
                >
                  <pre style={{ margin: 0, height: '100%' }}>
                    <code className="language-sql">{newSql.sqlText}</code>
                  </pre>
                </div>
              ) : null}

              <TextArea
                ref={textAreaRef}
                value={newSql.sqlText}
                onChange={handleSqlTextChange}
                onFocus={handleTextAreaFocus}
                placeholder="SELECT * FROM ..."
                style={{
                  display: showHighlighter ? 'none' : 'block',
                  height: '100%',
                  width: '100%', // 가로 크기 100%로 설정
                  boxSizing: 'border-box', // 패딩과 테두리를 너비에 포함
                }}
              />
            </div>

            <div style={{ display: 'flex', marginTop: '5px' }}>
              <Button
                onClick={toggleHighlighter}
                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
              >
                {showHighlighter ? '편집 모드' : '구문 강조 모드'}
              </Button>
            </div>

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
    </FullPageContainer>
  );
}
