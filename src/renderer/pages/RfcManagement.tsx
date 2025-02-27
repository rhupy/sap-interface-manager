// src/renderer/pages/RfcManagement.tsx
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
  ButtonGroup,
  SelectGroup,
  SmallLabel,
  SmallSelect,
  MetaInfo,
  FullPageContainer,
  DeleteButton,
  LeftAlignedLabel,
  TextArea,
  Select,
} from '../styles/CommonStyles';

import { useSettingsContext } from '../context/SettingContext';
import { RfcConnectionInfo, RfcFunctionInfo, RfcParameter } from '../types';

// RFC 함수 정보 기본값
const emptyRfcFunction: RfcFunctionInfo = {
  id: '',
  name: '',
  description: '',
  functionName: '',
  parameters: [],
  createdAt: '',
  updatedAt: '',
};

// 파라미터 기본값
const emptyParameter: RfcParameter = {
  name: '',
  type: 'import',
  dataType: 'STRING',
  description: '',
  defaultValue: '',
};

// 정렬 타입 정의
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function RfcManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const [message, setMessage] = useState('');
  const [newRfcFunction, setNewRfcFunction] =
    useState<RfcFunctionInfo>(emptyRfcFunction);
  const [newParameter, setNewParameter] =
    useState<RfcParameter>(emptyParameter);

  // 정렬 상태 추가
  const [sortType, setSortType] = useState<SortType>('name');

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value as SortType);
  };

  // 초기화: settings에 rfcFunctions가 없으면 빈 배열로 초기화
  useEffect(() => {
    if (!settings.rfcFunctions) {
      updateSettings({ rfcFunctions: [] });
    }
  }, [settings, updateSettings]);

  // 정렬 및 검색 적용된 RFC 함수 목록
  const filteredAndSortedRfcFunctions = React.useMemo(() => {
    // 검색어로 필터링
    const filtered = (settings.rfcFunctions || []).filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.functionName.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [settings.rfcFunctions, searchTerm, sortType]);

  // 선택된 RFC 함수가 변경될 때 newRfcFunction 업데이트
  useEffect(() => {
    if (!settings.selectedRfcFunctionId) {
      setNewRfcFunction(emptyRfcFunction);
      setNewParameter(emptyParameter);
      return;
    }

    const found = (settings.rfcFunctions || []).find(
      (func) => func.id === settings.selectedRfcFunctionId
    );

    if (found) {
      setNewRfcFunction(found);
      // 파라미터가 있으면 첫 번째 파라미터 선택
      if (found.parameters && found.parameters.length > 0) {
        setNewParameter(found.parameters[0]);
      } else {
        setNewParameter(emptyParameter);
      }
    } else {
      setNewRfcFunction(emptyRfcFunction);
      setNewParameter(emptyParameter);
    }
  }, [settings.selectedRfcFunctionId, settings.rfcFunctions]);

  // 현재 시간 포맷팅 함수
  function getCurrentFormattedTime() {
    const now = new Date();
    return now.toISOString();
  }

  // 시간 표시 포맷팅 함수
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

  // RFC 함수 선택 핸들러
  const handleSelectRfcFunction = (id: string) => {
    updateSettings({ selectedRfcFunctionId: id });
  };

  // 고유 ID 생성 함수
  const generateUniqueId = () => {
    return `rfc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // RFC 함수 추가 핸들러
  const handleAddRfcFunction = () => {
    if (!newRfcFunction.name || !newRfcFunction.functionName) {
      setMessage('함수 이름과 SAP 함수 이름을 입력하세요.');
      return;
    }

    const isDuplicate = (settings.rfcFunctions || []).some(
      (func) => func.name === newRfcFunction.name
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 함수 이름입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();
    const newId = generateUniqueId();

    const newFunction = {
      ...newRfcFunction,
      id: newId,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    // RFC 함수 목록에 추가
    updateSettings((prev) => ({
      ...prev,
      rfcFunctions: [...(prev.rfcFunctions || []), newFunction],
      selectedRfcFunctionId: newId,
    }));

    setMessage('RFC 함수가 추가되었습니다.');
  };

  // RFC 함수 수정 핸들러
  const handleUpdateRfcFunction = () => {
    if (!settings.selectedRfcFunctionId) {
      setMessage('수정할 RFC 함수가 선택되지 않았습니다.');
      return;
    }

    if (!newRfcFunction.name || !newRfcFunction.functionName) {
      setMessage('함수 이름과 SAP 함수 이름을 입력하세요.');
      return;
    }

    // 다른 함수와 중복 이름 검사
    const isDuplicate = (settings.rfcFunctions || []).some(
      (func) =>
        func.name === newRfcFunction.name &&
        func.id !== settings.selectedRfcFunctionId
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 함수 이름입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();

    // RFC 함수 목록 업데이트
    updateSettings((prev) => ({
      ...prev,
      rfcFunctions: (prev.rfcFunctions || []).map((func) =>
        func.id === settings.selectedRfcFunctionId
          ? { ...newRfcFunction, updatedAt: currentTime }
          : func
      ),
    }));

    setMessage('RFC 함수가 수정되었습니다.');
  };

  // RFC 함수 삭제 핸들러
  const handleDeleteRfcFunction = () => {
    if (!settings.selectedRfcFunctionId) {
      setMessage('삭제할 RFC 함수가 선택되지 않았습니다.');
      return;
    }

    // RFC 함수 목록에서 삭제
    updateSettings((prev) => ({
      ...prev,
      rfcFunctions: (prev.rfcFunctions || []).filter(
        (func) => func.id !== settings.selectedRfcFunctionId
      ),
      selectedRfcFunctionId: '',
    }));

    setMessage('RFC 함수가 삭제되었습니다.');
    setNewRfcFunction(emptyRfcFunction);
    setNewParameter(emptyParameter);
  };

  // 파라미터 추가 핸들러
  const handleAddParameter = () => {
    if (!newParameter.name) {
      setMessage('파라미터 이름을 입력하세요.');
      return;
    }

    // 중복 파라미터 이름 검사
    const isDuplicate = newRfcFunction.parameters.some(
      (param) => param.name === newParameter.name
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 파라미터 이름입니다.');
      return;
    }

    // 파라미터 추가
    const updatedParameters = [
      ...newRfcFunction.parameters,
      { ...newParameter },
    ];
    setNewRfcFunction({ ...newRfcFunction, parameters: updatedParameters });
    setNewParameter(emptyParameter); // 입력 필드 초기화

    setMessage('파라미터가 추가되었습니다.');
  };

  // 파라미터 수정 핸들러
  const handleUpdateParameter = (index: number) => {
    if (!newParameter.name) {
      setMessage('파라미터 이름을 입력하세요.');
      return;
    }

    // 중복 파라미터 이름 검사 (자기 자신 제외)
    const isDuplicate = newRfcFunction.parameters.some(
      (param, i) => param.name === newParameter.name && i !== index
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 파라미터 이름입니다.');
      return;
    }

    // 파라미터 수정
    const updatedParameters = [...newRfcFunction.parameters];
    updatedParameters[index] = { ...newParameter };
    setNewRfcFunction({ ...newRfcFunction, parameters: updatedParameters });

    setMessage('파라미터가 수정되었습니다.');
  };

  // 파라미터 삭제 핸들러
  const handleDeleteParameter = (index: number) => {
    const updatedParameters = [...newRfcFunction.parameters];
    updatedParameters.splice(index, 1);
    setNewRfcFunction({ ...newRfcFunction, parameters: updatedParameters });
    setNewParameter(emptyParameter); // 입력 필드 초기화

    setMessage('파라미터가 삭제되었습니다.');
  };

  // 파라미터 선택 핸들러
  const handleSelectParameter = (param: RfcParameter) => {
    setNewParameter({ ...param });
  };

  // RFC 연결 테스트 핸들러
  const testRfcFunction = async () => {
    if (!settings.selectedRfc) {
      setMessage('테스트할 RFC 연결을 선택하세요.');
      return;
    }

    if (!newRfcFunction.functionName) {
      setMessage('SAP 함수 이름을 입력하세요.');
      return;
    }

    setMessage('RFC 함수 테스트 중...');

    try {
      // RFC 연결 정보 찾기
      const rfcConnection = settings.rfcList.find(
        (rfc) => rfc.connectionName === settings.selectedRfc
      );

      if (!rfcConnection) {
        setMessage('선택한 RFC 연결 정보를 찾을 수 없습니다.');
        return;
      }

      // RFC 테스트 호출
      if (!window.api?.testRfcConnection) {
        setMessage('RFC 테스트 API를 사용할 수 없습니다.');
        return;
      }

      const result = await window.api.testRfcConnection(rfcConnection);

      if (result.success) {
        setMessage('RFC 연결 테스트 성공!');
      } else {
        setMessage(`RFC 연결 테스트 실패: ${result.message || ''}`);
      }
    } catch (error: any) {
      setMessage(`RFC 연결 테스트 에러: ${error?.message || error}`);
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return <div>RFC 설정을 불러오는 중...</div>;
  }

  return (
    <FullPageContainer>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <Title>RFC 관리</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Label style={{ marginRight: '10px' }}>RFC 연결:</Label>
          <Select
            value={settings.selectedRfc}
            onChange={(e) => updateSettings({ selectedRfc: e.target.value })}
            style={{ width: '200px' }}
          >
            <option value="">RFC 연결 선택</option>
            {settings.rfcList.map((rfc) => (
              <option key={rfc.connectionName} value={rfc.connectionName}>
                {rfc.connectionName}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Description>등록된 RFC 함수 목록 및 수정/추가/삭제 기능</Description>

      <FlexContainer>
        {/* 왼쪽 RFC 함수 목록 패널 */}
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
            {filteredAndSortedRfcFunctions.length === 0 ? (
              <div
                style={{ padding: '15px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 RFC 함수가 없습니다.'}
              </div>
            ) : (
              filteredAndSortedRfcFunctions.map((item) => (
                <ListItem
                  key={item.id}
                  active={item.id === settings.selectedRfcFunctionId}
                  onClick={() => handleSelectRfcFunction(item.id)}
                >
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#777' }}>
                    {/* {item.functionName} */}
                    {item.description && (
                      <div>
                        {item.description.slice(0, 30)}
                        {item.description.length > 30 ? '...' : ''}
                      </div>
                    )}
                    {item.parameters.length > 0
                      ? `Parameter: ${item.parameters.length}`
                      : ''}
                  </div>
                  <MetaInfo>
                    {sortType === 'name' ? (
                      <> 생성: {formatDateTime(item.createdAt)}</>
                    ) : sortType === 'createdAt' ? (
                      <> 생성: {formatDateTime(item.createdAt)}</>
                    ) : (
                      <> 수정: {formatDateTime(item.updatedAt)}</>
                    )}
                  </MetaInfo>
                </ListItem>
              ))
            )}
          </SidePanelContent>
        </SidePanel>

        {/* 오른쪽 RFC 함수 정보 패널 */}
        <MainPanel>
          <Section>
            <SectionTitle>RFC 함수 정보</SectionTitle>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>타이틀</LeftAlignedLabel>
                <Input
                  value={newRfcFunction.name}
                  onChange={(e) =>
                    setNewRfcFunction({
                      ...newRfcFunction,
                      name: e.target.value,
                    })
                  }
                  placeholder="예) GET_CUSTOMER_INFO"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>SAP 함수 이름</LeftAlignedLabel>
                <Input
                  value={newRfcFunction.functionName}
                  onChange={(e) =>
                    setNewRfcFunction({
                      ...newRfcFunction,
                      functionName: e.target.value,
                    })
                  }
                  placeholder="예) BAPI_CUSTOMER_GETDETAIL"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <LeftAlignedLabel>설명</LeftAlignedLabel>
              <Input
                value={newRfcFunction.description}
                onChange={(e) =>
                  setNewRfcFunction({
                    ...newRfcFunction,
                    description: e.target.value,
                  })
                }
                placeholder="함수에 대한 간단한 설명"
                style={{ width: '100%', maxWidth: 'none' }}
              />
            </div>

            {/* 생성/수정 시간 표시 */}
            {newRfcFunction.createdAt && (
              <div
                style={{
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                <div>생성: {formatDateTime(newRfcFunction.createdAt)}</div>
                {newRfcFunction.updatedAt &&
                  newRfcFunction.updatedAt !== newRfcFunction.createdAt && (
                    <div>수정: {formatDateTime(newRfcFunction.updatedAt)}</div>
                  )}
              </div>
            )}

            {/* 파라미터 섹션 */}
            <SectionTitle>파라미터</SectionTitle>

            {/* 파라미터 목록 */}
            <div
              style={{
                marginBottom: '10px',
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #eee',
                padding: '5px',
              }}
            >
              {newRfcFunction.parameters.length === 0 ? (
                <div
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  등록된 파라미터가 없습니다.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: '5px',
                          textAlign: 'left',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        이름
                      </th>
                      <th
                        style={{
                          padding: '5px',
                          textAlign: 'left',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        타입
                      </th>
                      <th
                        style={{
                          padding: '5px',
                          textAlign: 'left',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        데이터 타입
                      </th>
                      <th
                        style={{
                          padding: '5px',
                          textAlign: 'left',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        설명
                      </th>
                      <th
                        style={{
                          padding: '5px',
                          textAlign: 'center',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {newRfcFunction.parameters.map((param, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor:
                            newParameter.name === param.name
                              ? '#f0f7ff'
                              : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <td
                          style={{ padding: '5px' }}
                          onClick={() => handleSelectParameter(param)}
                        >
                          {param.name}
                        </td>
                        <td
                          style={{ padding: '5px' }}
                          onClick={() => handleSelectParameter(param)}
                        >
                          {param.type}
                        </td>
                        <td
                          style={{ padding: '5px' }}
                          onClick={() => handleSelectParameter(param)}
                        >
                          {param.dataType}
                        </td>
                        <td
                          style={{ padding: '5px' }}
                          onClick={() => handleSelectParameter(param)}
                        >
                          {param.description}
                        </td>
                        <td style={{ padding: '5px', textAlign: 'center' }}>
                          <Button
                            onClick={() => handleDeleteParameter(index)}
                            style={{
                              padding: '2px 5px',
                              fontSize: '0.8rem',
                              backgroundColor: '#e74c3c',
                            }}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 파라미터 편집 영역 */}
            <div
              style={{
                border: '1px solid #eee',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <LeftAlignedLabel>파라미터 이름</LeftAlignedLabel>
                  <Input
                    value={newParameter.name}
                    onChange={(e) =>
                      setNewParameter({ ...newParameter, name: e.target.value })
                    }
                    placeholder="예) CUSTOMER_ID"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                </div>
                <div>
                  <LeftAlignedLabel>파라미터 타입</LeftAlignedLabel>
                  <Select
                    value={newParameter.type}
                    onChange={(e) =>
                      setNewParameter({
                        ...newParameter,
                        type: e.target.value as any,
                      })
                    }
                    style={{ width: '100%', maxWidth: 'none' }}
                  >
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                    <option value="table">Table</option>
                  </Select>
                </div>
                <div>
                  <LeftAlignedLabel>데이터 타입</LeftAlignedLabel>
                  <Input
                    value={newParameter.dataType}
                    onChange={(e) =>
                      setNewParameter({
                        ...newParameter,
                        dataType: e.target.value,
                      })
                    }
                    placeholder="예) STRING"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <LeftAlignedLabel>설명</LeftAlignedLabel>
                <Input
                  value={newParameter.description || ''}
                  onChange={(e) =>
                    setNewParameter({
                      ...newParameter,
                      description: e.target.value,
                    })
                  }
                  placeholder="파라미터에 대한 설명"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>

              <div>
                <LeftAlignedLabel>기본값</LeftAlignedLabel>
                <Input
                  value={newParameter.defaultValue || ''}
                  onChange={(e) =>
                    setNewParameter({
                      ...newParameter,
                      defaultValue: e.target.value,
                    })
                  }
                  placeholder="기본값 (선택사항)"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>

              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  onClick={handleAddParameter}
                  style={{ marginRight: '5px' }}
                >
                  새 파라미터 추가
                </Button>
                {newRfcFunction.parameters.some(
                  (p) => p.name === newParameter.name
                ) && (
                  <Button
                    onClick={() => {
                      const index = newRfcFunction.parameters.findIndex(
                        (p) => p.name === newParameter.name
                      );
                      if (index !== -1) handleUpdateParameter(index);
                    }}
                  >
                    파라미터 수정
                  </Button>
                )}
              </div>
            </div>

            <ButtonGroup>
              {/* 선택된 RFC 함수가 없으면 '추가' 버튼만 */}
              {!settings.selectedRfcFunctionId ? (
                <Button onClick={handleAddRfcFunction}>새 RFC 함수 추가</Button>
              ) : (
                <>
                  <Button onClick={handleAddRfcFunction}>
                    새 RFC 함수 추가
                  </Button>
                  <Button
                    onClick={testRfcFunction}
                    disabled={!settings.selectedRfc}
                  >
                    연결 테스트
                  </Button>
                  <Button onClick={handleUpdateRfcFunction}>수정</Button>
                  <DeleteButton onClick={handleDeleteRfcFunction}>
                    삭제
                  </DeleteButton>
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
            message.includes('성공')
              ? '#4A90E2'
              : message.includes('테스트 중')
                ? '#f39c12'
                : '#E41E1E'
          }
        >
          {message}
        </FixedMessage>
      )}
    </FullPageContainer>
  );
}
