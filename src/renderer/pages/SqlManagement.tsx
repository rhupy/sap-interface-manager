import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Section,
  SectionTitle,
  Input,
  FlexContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  ListItem,
  MainPanel,
  TextArea,
  ButtonGroup,
  MetaInfo,
  FullPageContainer,
  DeleteButton,
  LeftAlignedLabel,
  Select,
} from '../styles/CommonStyles';
import { format } from 'sql-formatter';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import {
  formatDateTime,
  getCurrentFormattedTime,
  SortType,
  SqlInfo,
} from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import Button from '../components/smartButton';

const emptySqlInfo: SqlInfo = {
  id: '',
  name: '',
  description: '',
  sqlText: '',
  createdAt: '',
  updatedAt: '',
  parameters: [],
  outputParams: [],
};

const customStyles = `
  .token.parameter {
    color: #e74c3c !important;
    font-weight: bold !important;
  }
`;

export default function SqlManagement() {
  const { showMessage } = useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showHighlighter, setShowHighlighter] = useState(false);
  const [newSql, setNewSql] = useState<SqlInfo>(emptySqlInfo);
  const [paramList, setParamList] = useState<string[]>([]);
  const [outputParams, setOutputParams] = useState<string[]>([]); // 출력 파라미터 상태

  const { settings, updateSettings, isLoading } = useSettingsContext();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const filteredAndSortedSqlList = useMemo(() => {
    const filtered = (settings.sqlList || []).filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const handleSqlTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNewSql({ ...newSql, sqlText: newText });
    const extracted = extractParamsFromSql(newText);
    setParamList(extracted);
  };

  const extractParamsFromSql = (sqlText: string) => {
    const regex = /::([A-Za-z0-9_]+)/g;
    const results: string[] = [];
    let match;
    while ((match = regex.exec(sqlText)) !== null) {
      if (!results.includes(match[1])) {
        results.push(match[1]);
      }
    }
    return results;
  };

  const handleAddOutputParam = () => {
    const paramInput = document.getElementById(
      'outputParamInput'
    ) as HTMLInputElement;
    const param = paramInput?.value;
    if (param && !outputParams.includes(param)) {
      setOutputParams([...outputParams, param]);
      paramInput.value = ''; // 입력 후 초기화

      // 출력 파라미터를 newSql에 반영하여 Settings에 저장
      const updatedSql = { ...newSql, outputParams: [...outputParams, param] };
      setNewSql(updatedSql);

      // Settings에 업데이트
      updateSettings((prev) => ({
        ...prev,
        sqlList: (prev.sqlList || []).map((sql) =>
          sql.id === newSql.id ? updatedSql : sql
        ),
      }));
    }
  };

  const handleRemoveOutputParam = (param: string) => {
    const updatedOutputParams = outputParams.filter((p) => p !== param);
    setOutputParams(updatedOutputParams);

    // 삭제된 출력 파라미터를 newSql에 반영하여 Settings에 저장
    const updatedSql = { ...newSql, outputParams: updatedOutputParams };
    setNewSql(updatedSql);

    // Settings에 업데이트
    updateSettings((prev) => ({
      ...prev,
      sqlList: (prev.sqlList || []).map((sql) =>
        sql.id === newSql.id ? updatedSql : sql
      ),
    }));
  };

  useEffect(() => {
    if (!settings.selectedSqlId) {
      setNewSql(emptySqlInfo);
      setParamList([]);
      return;
    }

    const sqlList = settings.sqlList || [];
    const found = sqlList.find((sql) => sql.id === settings.selectedSqlId);
    if (found) {
      setNewSql(found);
      if (found.parameters && found.parameters.length > 0) {
        setParamList(found.parameters);
      } else {
        const extracted = extractParamsFromSql(found.sqlText);
        setParamList(extracted);
      }

      // 출력 파라미터도 설정
      if (found.outputParams && found.outputParams.length > 0) {
        setOutputParams(found.outputParams);
      }
    } else {
      setNewSql(emptySqlInfo);
      setParamList([]);
      setOutputParams([]);
    }
  }, [settings.selectedSqlId, settings.sqlList]);

  const toggleHighlighter = () => setShowHighlighter(!showHighlighter);

  const handleFormatSql = () => {
    if (!newSql.sqlText.trim()) {
      showMessage('SQL 문이 비어 있습니다.');
      return;
    }
    try {
      const paramPlaceholderRegex = /::([A-Za-z0-9_]+)/g;
      const tempSql = newSql.sqlText.replace(
        paramPlaceholderRegex,
        '__PARAM__$1'
      );
      const formatted = format(tempSql, {
        language: 'sql',
        keywordCase: 'upper',
        indentStyle: 'standard',
        tabWidth: 2,
      });
      const restoredSql = formatted.replace(
        /__PARAM__([A-Za-z0-9_]+)/g,
        '::$1'
      );
      setNewSql({ ...newSql, sqlText: restoredSql });
      const extracted = extractParamsFromSql(restoredSql);
      setParamList(extracted);
      showMessage('SQL이 정렬되었습니다.');
    } catch (error) {
      showMessage('SQL 정렬 중 오류가 발생했습니다.');
    }
  };

  const handleSelectSql = (id: string) => updateSettings({ selectedSqlId: id });

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

  if (isLoading) {
    return <div>SQL 설정을 불러오는 중...</div>;
  }

  return (
    <FullPageContainer>
      <FlexContainer>
        {/* 왼쪽 SQL 목록 패널 */}
        <SidePanel>
          <SidePanelHeader>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '-10px',
              }}
            >
              <Input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <Select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                style={{ width: '80px', marginRight: '5px' }}
              >
                <option value="name">이름</option>
                <option value="createdAt">생성</option>
                <option value="updatedAt">수정</option>
              </Select>
              <Button
                onClick={() =>
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                }
                style={{ padding: '3px 8px' }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
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
                />
              </div>
            </div>

            <LeftAlignedLabel>SQL 문</LeftAlignedLabel>
            <TextArea
              ref={textAreaRef}
              value={newSql.sqlText}
              onChange={handleSqlTextChange}
              onFocus={() => setShowHighlighter(false)}
            />
            <div>
              <Button onClick={toggleHighlighter}>
                {showHighlighter ? '편집 모드' : '구문 강조 모드'}
              </Button>
            </div>

            {/* 입력 파라미터 표시 */}
            {paramList.length > 0 && (
              <div style={{ margin: '10px 0' }}>
                <SectionTitle>입력 파라미터</SectionTitle>
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

            {/* 출력 파라미터 추가 */}
            <SectionTitle>출력 파라미터 추가</SectionTitle>
            <Input id="outputParamInput" placeholder="출력 파라미터 입력" />
            <Button onClick={handleAddOutputParam}>파라미터 추가</Button>

            {/* 출력 파라미터 목록 표시 */}
            {outputParams.length > 0 && (
              <div style={{ margin: '10px 0' }}>
                <SectionTitle>출력 파라미터</SectionTitle>
                <div>
                  {outputParams.map((param) => (
                    <div key={param}>
                      {param}
                      <Button onClick={() => handleRemoveOutputParam(param)}>
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ButtonGroup>
              <Button onClick={handleAddSql}>새 SQL 추가</Button>
              <Button onClick={handleFormatSql}>SQL 정렬</Button>
              <Button onClick={handleUpdateSql}>변경 사항 적용</Button>
              <DeleteButton onClick={handleDeleteSql}>삭제</DeleteButton>
            </ButtonGroup>
          </Section>
        </MainPanel>
      </FlexContainer>
    </FullPageContainer>
  );
}
