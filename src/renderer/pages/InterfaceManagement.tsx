import React, { useState, useEffect } from 'react';
import {
  FullPageContainer,
  FlexContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  MainPanel,
  Section,
  SectionTitle,
  ListItem,
  Input,
  Button,
  DeleteButton,
  Label,
  LeftAlignedLabel,
  Select,
  SelectGroup,
  SmallSelect,
  SmallLabel,
  MetaInfo,
  ButtonGroup,
  TextArea,
} from '../styles/CommonStyles';
import { Title, Description } from '../styles/CommonStyles';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import {
  InterfaceInfo,
  InterfaceStep,
  RfcFunctionInfo,
  SqlInfo,
} from '../types';

// 빈 인터페이스 정보
const emptyInterface: InterfaceInfo = {
  id: '',
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  steps: [],
};

// 빈 단계 정보
const emptyStep: InterfaceStep = {
  id: '',
  type: 'rfc',
  name: '',
  referenceId: '',
  order: 0,
};

// 정렬 타입
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function InterfaceManagement() {
  const { showMessage } = useMessage();
  const { settings, updateSettings, isLoading } = useSettingsContext();

  // 상태 관리
  const [newInterface, setNewInterface] =
    useState<InterfaceInfo>(emptyInterface);
  const [newStep, setNewStep] = useState<InterfaceStep>(emptyStep);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('updatedAt');
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepParameters, setStepParameters] = useState<Record<string, string>>(
    {}
  );

  // 현재 시간 포맷팅 함수
  function getCurrentFormattedTime() {
    const now = new Date();
    return now.toISOString();
  }

  // 날짜 포맷팅 함수
  function formatDateTime(dateTimeStr: string) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  // 인터페이스 목록 필터링 및 정렬
  const filteredAndSortedInterfaces = React.useMemo(() => {
    const interfaces = settings.interfaces || [];

    // 검색어로 필터링
    const filtered = interfaces.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬
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
  }, [settings.interfaces, searchTerm, sortType]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value as SortType);
  };

  // 인터페이스 선택 핸들러
  const handleSelectInterface = (id: string) => {
    updateSettings({ selectedInterfaceId: id });
  };

  // 선택된 인터페이스 ID가 변경될 때 newInterface 업데이트
  useEffect(() => {
    if (!settings.selectedInterfaceId) {
      setNewInterface(emptyInterface);
      return;
    }

    const found = (settings.interfaces || []).find(
      (item) => item.id === settings.selectedInterfaceId
    );

    if (found) {
      setNewInterface(found);
    } else {
      setNewInterface(emptyInterface);
    }
  }, [settings.selectedInterfaceId, settings.interfaces]);

  // 초기화: settings에 interfaces가 없으면 빈 배열로 초기화
  useEffect(() => {
    if (!settings.interfaces) {
      updateSettings({ interfaces: [] });
    }
  }, [settings, updateSettings]);

  // 인터페이스 추가 핸들러
  const handleAddInterface = () => {
    if (!newInterface.name) {
      showMessage('인터페이스 이름을 입력하세요.');
      return;
    }

    // 이름 중복 검사
    const isDuplicate = (settings.interfaces || []).some(
      (item) => item.name.toLowerCase() === newInterface.name.toLowerCase()
    );

    if (isDuplicate) {
      showMessage('이미 동일한 이름의 인터페이스가 존재합니다.', 'error');
      return;
    }

    // 새 인터페이스 ID 생성
    const id = `interface-${Date.now()}`;
    const currentTime = getCurrentFormattedTime();

    const interfaceToAdd: InterfaceInfo = {
      ...newInterface,
      id,
      createdAt: currentTime,
      updatedAt: currentTime,
      steps: [],
    };

    updateSettings((prev) => ({
      ...prev,
      interfaces: [...(prev.interfaces || []), interfaceToAdd],
      selectedInterfaceId: id,
    }));

    setNewInterface(emptyInterface);
    showMessage('새 인터페이스가 추가되었습니다.', 'success');
  };

  // 인터페이스 수정 핸들러
  const handleUpdateInterface = () => {
    if (!settings.selectedInterfaceId) {
      showMessage('수정할 인터페이스가 선택되지 않았습니다.');
      return;
    }

    if (!newInterface.name) {
      showMessage('인터페이스 이름을 입력하세요.');
      return;
    }

    const currentTime = getCurrentFormattedTime();

    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).map((item) =>
        item.id === settings.selectedInterfaceId
          ? { ...newInterface, updatedAt: currentTime }
          : item
      ),
    }));

    showMessage('인터페이스가 수정되었습니다.', 'success');
  };

  // 인터페이스 삭제 핸들러
  const handleDeleteInterface = () => {
    if (!settings.selectedInterfaceId) {
      showMessage('삭제할 인터페이스가 선택되지 않았습니다.');
      return;
    }

    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).filter(
        (item) => item.id !== settings.selectedInterfaceId
      ),
      selectedInterfaceId: '',
    }));

    showMessage('인터페이스가 삭제되었습니다.', 'success');
    setNewInterface(emptyInterface);
  };

  // 단계 추가 핸들러
  const handleAddStep = () => {
    if (!settings.selectedInterfaceId) {
      showMessage('인터페이스를 먼저 선택하세요.');
      return;
    }

    if (!newStep.type || !newStep.referenceId) {
      showMessage('단계 유형과 참조 항목을 선택하세요.');
      return;
    }

    // 참조하는 항목 찾기
    let referenceName = '';
    if (newStep.type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === newStep.referenceId
      );
      if (rfcFunction) {
        referenceName = rfcFunction.name;
      }
    } else if (newStep.type === 'sql') {
      const sql = (settings.sqlList || []).find(
        (s) => s.id === newStep.referenceId
      );
      if (sql) {
        referenceName = sql.name;
      }
    }

    if (!referenceName) {
      showMessage('참조 항목을 찾을 수 없습니다.', 'error');
      return;
    }

    const stepId = `step-${Date.now()}`;
    const newStepItem: InterfaceStep = {
      ...newStep,
      id: stepId,
      name: referenceName,
      order: newInterface.steps.length + 1,
      parameters: stepParameters,
    };

    // 인터페이스 단계 목록 업데이트
    const updatedSteps = [...newInterface.steps, newStepItem];
    setNewInterface({ ...newInterface, steps: updatedSteps });

    // 전체 설정 업데이트
    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).map((item) =>
        item.id === settings.selectedInterfaceId
          ? {
              ...item,
              steps: updatedSteps,
              updatedAt: getCurrentFormattedTime(),
            }
          : item
      ),
    }));

    // 입력 필드 초기화
    setNewStep(emptyStep);
    setStepParameters({});
    showMessage('단계가 추가되었습니다.', 'success');
  };

  // 단계 수정 핸들러
  const handleUpdateStep = () => {
    if (editingStepIndex === null) {
      showMessage('수정할 단계를 선택하세요.');
      return;
    }

    if (!newStep.type || !newStep.referenceId) {
      showMessage('단계 유형과 참조 항목을 선택하세요.');
      return;
    }

    // 참조하는 항목 찾기
    let referenceName = '';
    if (newStep.type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === newStep.referenceId
      );
      if (rfcFunction) {
        referenceName = rfcFunction.name;
      }
    } else if (newStep.type === 'sql') {
      const sql = (settings.sqlList || []).find(
        (s) => s.id === newStep.referenceId
      );
      if (sql) {
        referenceName = sql.name;
      }
    }

    if (!referenceName) {
      showMessage('참조 항목을 찾을 수 없습니다.', 'error');
      return;
    }

    // 단계 업데이트
    const updatedSteps = [...newInterface.steps];
    updatedSteps[editingStepIndex] = {
      ...newStep,
      name: referenceName,
      parameters: stepParameters,
    };

    // 인터페이스 업데이트
    setNewInterface({ ...newInterface, steps: updatedSteps });

    // 전체 설정 업데이트
    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).map((item) =>
        item.id === settings.selectedInterfaceId
          ? {
              ...item,
              steps: updatedSteps,
              updatedAt: getCurrentFormattedTime(),
            }
          : item
      ),
    }));

    // 입력 필드 초기화
    setNewStep(emptyStep);
    setStepParameters({});
    setEditingStepIndex(null);
    showMessage('단계가 수정되었습니다.', 'success');
  };

  // 단계 삭제 핸들러
  const handleDeleteStep = (index: number) => {
    const updatedSteps = newInterface.steps.filter((_, i) => i !== index);

    // 순서 재정렬
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      order: i + 1,
    }));

    // 인터페이스 업데이트
    setNewInterface({ ...newInterface, steps: reorderedSteps });

    // 전체 설정 업데이트
    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).map((item) =>
        item.id === settings.selectedInterfaceId
          ? {
              ...item,
              steps: reorderedSteps,
              updatedAt: getCurrentFormattedTime(),
            }
          : item
      ),
    }));

    showMessage('단계가 삭제되었습니다.', 'success');
  };

  // 단계 편집 시작 핸들러
  const handleEditStep = (index: number) => {
    const step = newInterface.steps[index];
    setNewStep(step);
    setStepParameters(step.parameters || {});
    setEditingStepIndex(index);
  };

  // 단계 순서 변경 핸들러
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!settings.selectedInterfaceId) return;

    const updatedSteps = [...newInterface.steps];

    if (direction === 'up' && index > 0) {
      // 위로 이동
      [updatedSteps[index], updatedSteps[index - 1]] = [
        updatedSteps[index - 1],
        updatedSteps[index],
      ];
    } else if (direction === 'down' && index < updatedSteps.length - 1) {
      // 아래로 이동
      [updatedSteps[index], updatedSteps[index + 1]] = [
        updatedSteps[index + 1],
        updatedSteps[index],
      ];
    } else {
      return; // 이동할 수 없는 경우
    }

    // 순서 재정렬
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      order: i + 1,
    }));

    // 인터페이스 업데이트
    setNewInterface({ ...newInterface, steps: reorderedSteps });

    // 전체 설정 업데이트
    updateSettings((prev) => ({
      ...prev,
      interfaces: (prev.interfaces || []).map((item) =>
        item.id === settings.selectedInterfaceId
          ? {
              ...item,
              steps: reorderedSteps,
              updatedAt: getCurrentFormattedTime(),
            }
          : item
      ),
    }));
  };

  // 파라미터 변경 핸들러
  const handleParameterChange = (paramName: string, value: string) => {
    setStepParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  // 참조 항목 옵션 가져오기
  const getReferenceOptions = () => {
    if (newStep.type === 'rfc') {
      return settings.rfcFunctions || [];
    } else if (newStep.type === 'sql') {
      return settings.sqlList || [];
    }
    return [];
  };

  // 참조 항목 이름 가져오기
  const getReferenceName = (type: string, id: string) => {
    if (type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === id
      );
      return rfcFunction
        ? `${rfcFunction.name} (${rfcFunction.functionName})`
        : '알 수 없음';
    } else if (type === 'sql') {
      const sql = (settings.sqlList || []).find((s) => s.id === id);
      return sql ? sql.name : '알 수 없음';
    }
    return '';
  };

  // 파라미터 필드 가져오기
  const getParameterFields = () => {
    if (!newStep.referenceId) return [];

    if (newStep.type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === newStep.referenceId
      );
      return rfcFunction ? rfcFunction.parameters : [];
    } else if (newStep.type === 'sql') {
      const sql = (settings.sqlList || []).find(
        (s) => s.id === newStep.referenceId
      );
      return sql ? sql.parameters || [] : [];
    }
    return [];
  };

  return (
    <FullPageContainer>
      <Title>인터페이스 관리</Title>
      <Description>
        RFC 함수와 SQL 쿼리를 조합하여 인터페이스를 구성합니다.
      </Description>

      <FlexContainer>
        {/* 왼쪽 인터페이스 목록 패널 */}
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
                <SmallSelect value={sortType} onChange={handleSortTypeChange}>
                  <option value="name">이름순</option>
                  <option value="createdAt">생성시간순</option>
                  <option value="updatedAt">수정시간순</option>
                </SmallSelect>
              </SelectGroup>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-center',
                }}
              >
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="검색..."
                  style={{
                    width: '150px',
                    padding: '5px',
                    fontSize: '0.9rem',
                    height: '30px',
                  }}
                />
              </div>
            </div>
          </SidePanelHeader>

          <SidePanelContent>
            {filteredAndSortedInterfaces.length === 0 ? (
              <div
                style={{ padding: '15px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 인터페이스가 없습니다.'}
              </div>
            ) : (
              filteredAndSortedInterfaces.map((item) => (
                <ListItem
                  key={item.id}
                  active={item.id === settings.selectedInterfaceId}
                  onClick={() => handleSelectInterface(item.id)}
                >
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#777' }}>
                    {item.description && (
                      <div>
                        {item.description.slice(0, 30)}
                        {item.description.length > 30 ? '...' : ''}
                      </div>
                    )}
                    {`단계: ${item.steps.length}개`}
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

        {/* 오른쪽 인터페이스 정보 패널 */}
        <MainPanel>
          <Section>
            <SectionTitle>인터페이스 정보</SectionTitle>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>인터페이스 이름</LeftAlignedLabel>
                <Input
                  value={newInterface.name}
                  onChange={(e) =>
                    setNewInterface({ ...newInterface, name: e.target.value })
                  }
                  placeholder="인터페이스 이름 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <LeftAlignedLabel>설명</LeftAlignedLabel>
                <Input
                  value={newInterface.description}
                  onChange={(e) =>
                    setNewInterface({
                      ...newInterface,
                      description: e.target.value,
                    })
                  }
                  placeholder="인터페이스에 대한 설명"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            </div>

            {/* 생성/수정 시간 표시 */}
            {newInterface.createdAt && (
              <div
                style={{
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                <div>생성: {formatDateTime(newInterface.createdAt)}</div>
                {newInterface.updatedAt &&
                  newInterface.updatedAt !== newInterface.createdAt && (
                    <div>수정: {formatDateTime(newInterface.updatedAt)}</div>
                  )}
              </div>
            )}

            {/* 인터페이스 버튼 그룹 */}
            <ButtonGroup>
              {!settings.selectedInterfaceId ? (
                <Button onClick={handleAddInterface}>새 인터페이스 추가</Button>
              ) : (
                <>
                  <Button onClick={handleAddInterface}>
                    새 인터페이스 추가
                  </Button>
                  <Button onClick={handleUpdateInterface}>수정</Button>
                  <DeleteButton onClick={handleDeleteInterface}>
                    삭제
                  </DeleteButton>
                </>
              )}
            </ButtonGroup>

            {/* 단계 섹션 */}
            {settings.selectedInterfaceId && (
              <>
                <SectionTitle style={{ marginTop: '20px' }}>
                  단계 관리
                </SectionTitle>

                {/* 단계 추가/수정 폼 */}
                <div
                  style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <LeftAlignedLabel>단계 유형</LeftAlignedLabel>
                      <Select
                        value={newStep.type}
                        onChange={(e) =>
                          setNewStep({
                            ...newStep,
                            type: e.target.value as 'rfc' | 'sql',
                            referenceId: '', // 유형 변경 시 참조 ID 초기화
                          })
                        }
                        style={{ width: '100%', maxWidth: 'none' }}
                      >
                        <option value="">유형 선택</option>
                        <option value="rfc">RFC 함수</option>
                        <option value="sql">SQL 쿼리</option>
                      </Select>
                    </div>
                    <div style={{ flex: 2 }}>
                      <LeftAlignedLabel>참조 항목</LeftAlignedLabel>
                      <Select
                        value={newStep.referenceId}
                        onChange={(e) => {
                          setNewStep({
                            ...newStep,
                            referenceId: e.target.value,
                          });
                          setStepParameters({}); // 참조 항목 변경 시 파라미터 초기화
                        }}
                        style={{ width: '100%', maxWidth: 'none' }}
                        disabled={!newStep.type}
                      >
                        <option value="">항목 선택</option>
                        {getReferenceOptions().map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* 파라미터 입력 필드 */}
                  {newStep.referenceId && (
                    <div style={{ marginTop: '10px' }}>
                      <LeftAlignedLabel>파라미터</LeftAlignedLabel>
                      {getParameterFields().length === 0 ? (
                        <div
                          style={{
                            color: '#666',
                            fontSize: '0.9rem',
                            marginTop: '5px',
                          }}
                        >
                          파라미터가 없습니다.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr',
                            gap: '5px',
                          }}
                        >
                          {getParameterFields().map((param: any) => (
                            <React.Fragment key={param.name || param}>
                              <div
                                style={{
                                  padding: '5px',
                                  backgroundColor: '#f0f0f0',
                                  borderRadius: '4px',
                                }}
                              >
                                {param.name || param}
                              </div>
                              <Input
                                value={
                                  stepParameters[param.name || param] || ''
                                }
                                onChange={(e) =>
                                  handleParameterChange(
                                    param.name || param,
                                    e.target.value
                                  )
                                }
                                placeholder="값 입력"
                                style={{ width: '100%', maxWidth: 'none' }}
                              />
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      justifyContent: 'flex-start',
                    }}
                  >
                    {editingStepIndex !== null ? (
                      <>
                        <Button
                          onClick={handleUpdateStep}
                          style={{ marginRight: '5px' }}
                        >
                          단계 수정
                        </Button>
                        <Button
                          onClick={() => {
                            setNewStep(emptyStep);
                            setStepParameters({});
                            setEditingStepIndex(null);
                          }}
                          style={{ backgroundColor: '#6c757d' }}
                        >
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleAddStep}>단계 추가</Button>
                    )}
                  </div>
                </div>

                {/* 단계 목록 */}
                {newInterface.steps.length > 0 ? (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      단계 목록 ({newInterface.steps.length}개)
                    </div>
                    {newInterface.steps.map((step, index) => (
                      <div
                        key={step.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          marginBottom: '5px',
                          border: '1px solid #ddd',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {index + 1}. {step.name} (
                            {step.type === 'rfc' ? 'RFC 함수' : 'SQL 쿼리'})
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {getReferenceName(step.type, step.referenceId)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <Button
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                              backgroundColor: '#6c757d',
                            }}
                          >
                            ↑
                          </Button>
                          <Button
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === newInterface.steps.length - 1}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                              backgroundColor: '#6c757d',
                            }}
                          >
                            ↓
                          </Button>
                          <Button
                            onClick={() => handleEditStep(index)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            onClick={() => handleDeleteStep(index)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                              backgroundColor: '#e74c3c',
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      color: '#666',
                      marginTop: '10px',
                      textAlign: 'center',
                    }}
                  >
                    등록된 단계가 없습니다. 단계를 추가해주세요.
                  </div>
                )}
              </>
            )}
          </Section>
        </MainPanel>
      </FlexContainer>
    </FullPageContainer>
  );
}
