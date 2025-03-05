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
  RfcParameter,
} from '../types';
import { ParameterMappingCanvas } from '../components/ParameterMapping';
import {
  MappingItem,
  MappingConnection,
} from '../components/ParameterMapping/types';
import { InterfaceExecutor } from '../components/InterfaceExecutor';
import { InterfaceExecutorProvider } from '../context/InterfaceExecutorContext';

// 빈 인터페이스 정보
const emptyInterface: InterfaceInfo = {
  id: '',
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  steps: [],
};

// 빈 작업 정보
const emptyStep: InterfaceStep = {
  id: '',
  type: 'rfc',
  name: '',
  referenceId: '',
  order: 0,
  parameters: {},
};

// 정렬 타입
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function InterfaceManagement() {
  const { settings, updateSettings } = useSettingsContext();
  const { showMessage } = useMessage();

  // 인터페이스 목록
  const [interfaces, setInterfaces] = useState<InterfaceInfo[]>([]);
  // 새 인터페이스 정보
  const [newInterface, setNewInterface] =
    useState<InterfaceInfo>(emptyInterface);
  // 새 작업 정보
  const [newStep, setNewStep] = useState<InterfaceStep>(emptyStep);
  // 작업 편집 모드
  const [isEditingStep, setIsEditingStep] = useState(false);
  // 편집 중인 작업 인덱스
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  // 정렬 방식
  const [sortType, setSortType] = useState<SortType>('name');
  // 정렬 방향 (오름차순/내림차순)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // 검색어
  const [searchTerm, setSearchTerm] = useState('');
  // 파라미터 매핑 다이얼로그 표시 여부
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  // 매핑 중인 작업 인덱스
  const [mappingStepIndex, setMappingStepIndex] = useState<number | null>(null);
  // 현재 매핑 정보
  const [currentMappings, setCurrentMappings] = useState<
    Record<string, string>
  >({});

  // 인터페이스 목록 정렬 및 필터링
  const getSortedAndFilteredInterfaces = () => {
    // 검색어로 필터링
    const filtered = (settings.interfaces || []).filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬
    return filtered.sort((a, b) => {
      let valueA, valueB;

      if (sortType === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (sortType === 'createdAt') {
        valueA = a.createdAt;
        valueB = b.createdAt;
      } else {
        valueA = a.updatedAt;
        valueB = b.updatedAt;
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (settings.interfaces) {
      setInterfaces(settings.interfaces);
    }

    // 선택된 인터페이스가 있으면 로드
    if (settings.selectedInterfaceId) {
      const selectedInterface = settings.interfaces?.find(
        (item) => item.id === settings.selectedInterfaceId
      );
      if (selectedInterface) {
        setNewInterface(selectedInterface);
      }
    }
  }, [settings]);

  // 인터페이스 선택 핸들러
  const handleSelectInterface = (id: string) => {
    const selectedInterface = interfaces.find((item) => item.id === id);
    if (selectedInterface) {
      setNewInterface(selectedInterface);
      updateSettings({
        ...settings,
        selectedInterfaceId: id,
      });
    }
  };

  // 인터페이스 추가 핸들러
  const handleAddInterface = () => {
    if (!newInterface.name) {
      showMessage('인터페이스 이름을 입력하세요.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newId = `interface_${Date.now()}`;
    const interfaceToAdd = {
      ...newInterface,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    const updatedInterfaces = [...(settings.interfaces || []), interfaceToAdd];
    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
      selectedInterfaceId: newId,
    });

    setNewInterface(interfaceToAdd);
    showMessage('인터페이스가 추가되었습니다.', 'success');
  };

  // 인터페이스 수정 핸들러
  const handleUpdateInterface = () => {
    if (!newInterface.id) return;

    const now = new Date().toISOString();
    const updatedInterface = {
      ...newInterface,
      updatedAt: now,
    };

    const updatedInterfaces = (settings.interfaces || []).map((item) =>
      item.id === updatedInterface.id ? updatedInterface : item
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
    });

    setNewInterface(updatedInterface);
    showMessage('인터페이스가 수정되었습니다.', 'success');
  };

  // 인터페이스 삭제 핸들러
  const handleDeleteInterface = () => {
    if (!newInterface.id) return;

    const updatedInterfaces = (settings.interfaces || []).filter(
      (item) => item.id !== newInterface.id
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
      selectedInterfaceId:
        updatedInterfaces.length > 0 ? updatedInterfaces[0].id : '',
    });

    if (updatedInterfaces.length > 0) {
      setNewInterface(updatedInterfaces[0]);
    } else {
      setNewInterface(emptyInterface);
    }

    showMessage('인터페이스가 삭제되었습니다.', 'success');
  };

  // 작업 추가 핸들러
  const handleAddStep = () => {
    if (!newInterface.id) {
      showMessage('먼저 인터페이스를 생성하세요.', 'error');
      return;
    }

    if (!newStep.name || !newStep.referenceId) {
      showMessage('작업 이름과 참조 항목을 선택하세요.', 'error');
      return;
    }

    const stepId = `step_${Date.now()}`;
    const stepToAdd = {
      ...newStep,
      id: stepId,
      order: newInterface.steps.length,
    };

    const updatedSteps = [...newInterface.steps, stepToAdd];
    const updatedInterface = {
      ...newInterface,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedInterfaces = (settings.interfaces || []).map((item) =>
      item.id === updatedInterface.id ? updatedInterface : item
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
    });

    setNewInterface(updatedInterface);
    setNewStep(emptyStep);
    showMessage('작업가 추가되었습니다.', 'success');
  };

  // 작업 수정 핸들러
  const handleUpdateStep = () => {
    if (!isEditingStep || editingStepIndex === null) return;

    const updatedSteps = [...newInterface.steps];
    updatedSteps[editingStepIndex] = {
      ...newStep,
      order: editingStepIndex,
    };

    const updatedInterface = {
      ...newInterface,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedInterfaces = (settings.interfaces || []).map((item) =>
      item.id === updatedInterface.id ? updatedInterface : item
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
    });

    setNewInterface(updatedInterface);
    setNewStep(emptyStep);
    setIsEditingStep(false);
    setEditingStepIndex(null);
    showMessage('작업가 수정되었습니다.', 'success');
  };

  // 작업 삭제 핸들러
  const handleDeleteStep = (index: number) => {
    const updatedSteps = newInterface.steps.filter((_, i) => i !== index);

    // 순서 재조정
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      order: i,
    }));

    const updatedInterface = {
      ...newInterface,
      steps: reorderedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedInterfaces = (settings.interfaces || []).map((item) =>
      item.id === updatedInterface.id ? updatedInterface : item
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
    });

    setNewInterface(updatedInterface);
    showMessage('작업가 삭제되었습니다.', 'success');
  };

  // 작업 편집 모드 시작
  const handleEditStep = (index: number) => {
    setNewStep(newInterface.steps[index]);
    setIsEditingStep(true);
    setEditingStepIndex(index);
  };

  // 작업 편집 취소
  const handleCancelEdit = () => {
    setNewStep(emptyStep);
    setIsEditingStep(false);
    setEditingStepIndex(null);
  };

  // 파라미터 매핑 다이얼로그 열기 핸들러
  const handleOpenMappingDialog = (index: number) => {
    const step = newInterface.steps[index];
    setMappingStepIndex(index);
    setCurrentMappings(step.parameters || {});
    setShowMappingDialog(true);
  };

  // 파라미터 매핑 저장 핸들러
  const handleSaveMappings = (mappings: Record<string, string>) => {
    if (mappingStepIndex === null) return;

    const updatedSteps = [...newInterface.steps];
    updatedSteps[mappingStepIndex] = {
      ...updatedSteps[mappingStepIndex],
      parameters: mappings,
    };

    const updatedInterface = {
      ...newInterface,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedInterfaces = (settings.interfaces || []).map((item) =>
      item.id === updatedInterface.id ? updatedInterface : item
    );

    updateSettings({
      ...settings,
      interfaces: updatedInterfaces,
    });

    setNewInterface(updatedInterface);
    setShowMappingDialog(false);
    setMappingStepIndex(null);
    showMessage('파라미터 매핑이 저장되었습니다.', 'success');
  };

  // 입력 파라미터 필드 가져오기
  const getParameterFields = (type: string, referenceId: string) => {
    if (type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === referenceId
      );
      if (!rfcFunction) return [];
      return rfcFunction.parameters.filter((p) => p.type === 'import');
    } else if (type === 'sql') {
      // SQL의 경우 입력 파라미터 (바인딩 변수) 추출
      const sqlInfo = (settings.sqlList || []).find(
        (s) => s.id === referenceId
      );
      if (!sqlInfo) return [];

      // SQL 문에서 :파라미터 형태로 된 것들을 추출
      const paramRegex = /:([A-Za-z0-9_]+)/g;
      const sqlText = sqlInfo.sqlText || '';
      const matches = [...sqlText.matchAll(paramRegex)];

      return matches.map((match) => match[1]);
    }
    return [];
  };

  // 출력 파라미터 가져오기
  const getOutputParameters = (type: string, referenceId: string) => {
    if (type === 'rfc') {
      const rfcFunction = (settings.rfcFunctions || []).find(
        (f) => f.id === referenceId
      );
      if (!rfcFunction) return [];
      return rfcFunction.parameters.filter((p) => p.type === 'export');
    } else if (type === 'sql') {
      // SQL의 경우 모든 컬럼을 출력 파라미터로 간주
      return ['RESULT'];
    }
    return [];
  };

  // 파라미터 매핑 다이얼로그 컴포넌트
  const ParameterMappingDialog = () => {
    if (mappingStepIndex === null || !showMappingDialog) return null;

    const currentStep = newInterface.steps[mappingStepIndex];
    const previousSteps = newInterface.steps.slice(0, mappingStepIndex);

    // 현재 작업의 입력 파라미터 가져오기
    const inputParams = getParameterFields(
      currentStep.type,
      currentStep.referenceId
    );

    // 이전 작업들의 출력 파라미터 가져오기
    const outputParams = previousSteps.flatMap((step, idx) => {
      const params = getOutputParameters(step.type, step.referenceId);
      return params.map((param) => {
        const paramName = typeof param === 'string' ? param : param.name;
        return {
          stepIndex: idx,
          stepName: step.name,
          paramName,
          fullPath: `${step.name}.${paramName}`,
        };
      });
    });

    // 매핑 아이템 변환
    const sourceItems: MappingItem[] = outputParams.map((param) => ({
      id: `${param.stepIndex}-${param.paramName}`,
      label: `${param.stepName}.${param.paramName}`,
      data: param,
    }));

    const targetItems: MappingItem[] = inputParams.map((param) => {
      const paramName = typeof param === 'string' ? param : param.name;
      return {
        id: paramName,
        label: paramName,
        data: param,
      };
    });

    // 연결 정보 변환
    const connections: MappingConnection[] = Object.entries(currentMappings)
      .filter(([_, value]) => value.includes('.'))
      .map(([paramName, value]) => {
        const sourceParam = outputParams.find((p) => p.fullPath === value);
        if (!sourceParam) return null;

        return {
          id: `${sourceParam.stepIndex}-${sourceParam.paramName}-${paramName}`,
          sourceId: `${sourceParam.stepIndex}-${sourceParam.paramName}`,
          targetId: paramName,
          sourceLabel: `${sourceParam.stepName}.${sourceParam.paramName}`,
          targetLabel: paramName,
        };
      })
      .filter(Boolean) as MappingConnection[];

    const handleConnectionsChange = (newConnections: MappingConnection[]) => {
      const newMappings = { ...currentMappings };

      // 기존 매핑 중 연결 관련 항목 제거
      Object.keys(newMappings).forEach((key) => {
        if (newMappings[key].includes('.')) {
          delete newMappings[key];
        }
      });

      // 새 연결 추가
      newConnections.forEach((conn) => {
        const sourceItem = sourceItems.find(
          (item) => item.id === conn.sourceId
        );
        if (sourceItem && sourceItem.data) {
          newMappings[conn.targetLabel] = sourceItem.data.fullPath;
        }
      });

      setCurrentMappings(newMappings);
    };

    // 연결 삭제 핸들러
    const handleDeleteConnection = (connectionId: string) => {
      const updatedConnections = connections.filter(
        (conn) => conn.id !== connectionId
      );
      handleConnectionsChange(updatedConnections);
    };

    return (
      <div
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '900px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>
            파라미터 매핑 - {currentStep.name}
          </h3>

          <div
            style={{
              flex: 1,
              overflow: 'auto',
              marginBottom: '15px',
              minHeight: '400px',
              maxHeight: 'calc(80vh - 130px)', // 헤더와 버튼 영역 제외한 높이
            }}
          >
            <ParameterMappingCanvas
              sourceItems={sourceItems}
              targetItems={targetItems}
              connections={connections}
              onConnectionsChange={handleConnectionsChange}
              onDeleteConnection={handleDeleteConnection}
              sourceTitle="이전 작업 출력 파라미터"
              targetTitle="현재 작업 입력 파라미터"
              containerStyle={{ minHeight: '100%' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderTop: '1px solid #eee',
              backgroundColor: 'white',
            }}
          >
            <div>
              <small style={{ color: '#666' }}>
                * 연결선을 클릭하면 매핑이 삭제됩니다.
              </small>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '10px',
              }}
            >
              <Button onClick={() => handleSaveMappings(currentMappings)}>
                저장
              </Button>
              <Button
                onClick={() => {
                  setShowMappingDialog(false);
                  setMappingStepIndex(null);
                }}
                style={{ backgroundColor: '#6c757d' }}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FullPageContainer>
      <FlexContainer>
        <SidePanel>
          <SidePanelHeader>
            <h3>인터페이스 목록</h3>
            <div style={{ display: 'flex', marginBottom: '10px' }}>
              <Input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, marginRight: '5px' }}
              />
              <SmallSelect
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                style={{ width: '80px', marginRight: '5px' }}
              >
                <option value="name">이름</option>
                <option value="createdAt">생성일</option>
                <option value="updatedAt">수정일</option>
              </SmallSelect>
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
            {getSortedAndFilteredInterfaces().length > 0 ? (
              getSortedAndFilteredInterfaces().map((item) => (
                <ListItem
                  key={item.id}
                  active={item.id === settings.selectedInterfaceId}
                  onClick={() => handleSelectInterface(item.id)}
                >
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <MetaInfo>
                    생성: {item.createdAt}
                    <br />
                    수정: {item.updatedAt}
                  </MetaInfo>
                </ListItem>
              ))
            ) : (
              <div
                style={{ padding: '10px', color: '#666', textAlign: 'center' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 인터페이스가 없습니다.'}
              </div>
            )}
          </SidePanelContent>
        </SidePanel>

        <MainPanel
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Section style={{ height: '150px', minHeight: '150px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <SectionTitle>인터페이스 정보</SectionTitle>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <LeftAlignedLabel>테스트 연결</LeftAlignedLabel>
                  <Select
                    value={settings.selectedRfc}
                    onChange={(e) =>
                      updateSettings({ selectedRfc: e.target.value })
                    }
                    style={{ width: '180px' }}
                  >
                    <option value="">RFC 연결 선택</option>
                    {settings.rfcConnections.map((rfc) => (
                      <option
                        key={rfc.connectionName}
                        value={rfc.connectionName}
                      >
                        {rfc.connectionName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={settings.selectedDbId}
                    onChange={(e) =>
                      updateSettings({ selectedDbId: e.target.value })
                    }
                    style={{ width: '180px' }}
                  >
                    <option value="">DB 연결 선택</option>
                    {settings.dbConnections.map((db) => (
                      <option key={db.connectionName} value={db.connectionName}>
                        {db.connectionName}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>타이틀</LeftAlignedLabel>
                <Input
                  type="text"
                  value={newInterface.name}
                  onChange={(e) =>
                    setNewInterface({
                      ...newInterface,
                      name: e.target.value,
                    })
                  }
                  placeholder="인터페이스 이름을 입력하세요"
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
                  placeholder="인터페이스에 대한 설명을 입력하세요"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div
                style={{
                  width: '180px',
                  textAlign: 'right',
                  alignSelf: 'flex-end',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    whiteSpace: 'nowrap',
                    paddingBottom: '5px',
                  }}
                >
                  <div>생성: {newInterface.createdAt || '새 인터페이스'}</div>
                  <div>수정: {newInterface.updatedAt || '새 인터페이스'}</div>
                </div>
              </div>
              <div
                style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}
              >
                <Button onClick={handleAddInterface}>새 인터페이스 추가</Button>
                <Button
                  onClick={handleDeleteInterface}
                  style={{ backgroundColor: '#e74c3c' }}
                >
                  삭제
                </Button>
              </div>
            </div>
          </Section>

          {newInterface.id && (
            <>
              <Section style={{ height: '140px', minHeight: '140px' }}>
                <SectionTitle>작업 관리</SectionTitle>
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <LeftAlignedLabel>작업 유형</LeftAlignedLabel>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        onClick={() =>
                          setNewStep({
                            ...newStep,
                            type: 'rfc',
                            referenceId: '',
                            name: '',
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor:
                            newStep.type === 'rfc' ? '#007bff' : '#f8f9fa',
                          color: newStep.type === 'rfc' ? 'white' : '#212529',
                          border: '1px solid #ced4da',
                          fontWeight:
                            newStep.type === 'rfc' ? 'bold' : 'normal',
                        }}
                      >
                        RFC 함수
                      </Button>
                      <Button
                        onClick={() =>
                          setNewStep({
                            ...newStep,
                            type: 'sql',
                            referenceId: '',
                            name: '',
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor:
                            newStep.type === 'sql' ? '#007bff' : '#f8f9fa',
                          color: newStep.type === 'sql' ? 'white' : '#212529',
                          border: '1px solid #ced4da',
                          fontWeight:
                            newStep.type === 'sql' ? 'bold' : 'normal',
                        }}
                      >
                        SQL 쿼리
                      </Button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <LeftAlignedLabel>작업 선택</LeftAlignedLabel>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Select
                        value={newStep.referenceId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          let selectedName = '';

                          if (newStep.type === 'rfc') {
                            const selectedFunc = settings.rfcFunctions?.find(
                              (func) => func.id === selectedId
                            );
                            selectedName = selectedFunc?.name || '';
                          } else if (newStep.type === 'sql') {
                            const selectedSql = settings.sqlList?.find(
                              (sql) => sql.id === selectedId
                            );
                            selectedName = selectedSql?.name || '';
                          }

                          setNewStep({
                            ...newStep,
                            referenceId: selectedId,
                            name: selectedName,
                          });
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="">선택하세요</option>
                        {newStep.type === 'rfc' &&
                          (settings.rfcFunctions || []).map((func) => (
                            <option key={func.id} value={func.id}>
                              {func.name}
                            </option>
                          ))}
                        {newStep.type === 'sql' &&
                          (settings.sqlList || []).map((sql) => (
                            <option key={sql.id} value={sql.id}>
                              {sql.name}
                            </option>
                          ))}
                      </Select>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <LeftAlignedLabel>작업 이름</LeftAlignedLabel>
                    <Input
                      type="text"
                      value={newStep.name}
                      onChange={(e) =>
                        setNewStep({
                          ...newStep,
                          name: e.target.value,
                        })
                      }
                      placeholder="작업 선택 시 자동으로 입력됩니다"
                      style={{ width: '100%', maxWidth: 'none' }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'flex-end',
                      alignSelf: 'flex-end',
                    }}
                  >
                    {!isEditingStep ? (
                      <Button onClick={handleAddStep}>추가</Button>
                    ) : (
                      <>
                        <Button onClick={handleUpdateStep}>수정</Button>
                        <Button
                          onClick={handleCancelEdit}
                          style={{ backgroundColor: '#6c757d' }}
                        >
                          취소
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Section>

              <Section style={{ flex: 1, overflow: 'auto' }}>
                <SectionTitle>작업 목록</SectionTitle>
                {newInterface.steps.length > 0 ? (
                  <div>
                    {newInterface.steps.map((step, index) => (
                      <div
                        key={step.id}
                        style={{
                          padding: '10px',
                          marginBottom: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>
                            {index + 1}. {step.type === 'rfc' ? 'RFC' : 'SQL'} (
                            {step.name})
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <Button
                              onClick={() => handleOpenMappingDialog(index)}
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.8rem',
                                marginRight: '5px',
                                backgroundColor: '#17a2b8',
                              }}
                            >
                              매핑
                            </Button>
                            <Button
                              onClick={() => handleEditStep(index)}
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.8rem',
                                marginRight: '5px',
                              }}
                            >
                              편집
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

                        {/* 파라미터 매핑 정보 표시 */}
                        {step.parameters &&
                          Object.keys(step.parameters).length > 0 && (
                            <div
                              style={{
                                marginTop: '5px',
                                padding: '5px',
                                backgroundColor: '#e8f4fc',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 'bold',
                                  marginBottom: '3px',
                                }}
                              >
                                파라미터 매핑:
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '5px',
                                }}
                              >
                                {Object.entries(step.parameters).map(
                                  ([paramName, value]) => {
                                    const isReference = value.includes('.');
                                    return (
                                      <div
                                        key={paramName}
                                        style={{
                                          padding: '2px 6px',
                                          backgroundColor: isReference
                                            ? '#d1ecf1'
                                            : '#f8f9fa',
                                          border: `1px solid ${isReference ? '#bee5eb' : '#ddd'}`,
                                          borderRadius: '3px',
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <span style={{ fontWeight: 'bold' }}>
                                          {paramName}
                                        </span>
                                        <span style={{ margin: '0 3px' }}>
                                          ←
                                        </span>
                                        <span
                                          style={{
                                            color: isReference
                                              ? '#0c5460'
                                              : '#6c757d',
                                            fontStyle: isReference
                                              ? 'normal'
                                              : 'italic',
                                          }}
                                        >
                                          {value}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
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
                    등록된 작업이 없습니다. 작업을 추가해주세요.
                  </div>
                )}
                {/* 인터페이스 실행기 */}
                <InterfaceExecutor
                  rfcFunctions={settings.rfcFunctions || []}
                  sqlList={settings.sqlList || []}
                  interface={newInterface}
                  sapConnections={settings.rfcConnections}
                  dbConnections={settings.dbConnections}
                  selectedSapConnection={settings.selectedRfc}
                  selectedDbConnection={settings.selectedDbId}
                  onConnectionChange={(type, value) => {
                    if (type === 'sap') {
                      updateSettings({ selectedRfc: value });
                    } else {
                      updateSettings({ selectedDbId: value });
                    }
                  }}
                />
              </Section>
            </>
          )}
        </MainPanel>
      </FlexContainer>

      {/* 파라미터 매핑 다이얼로그 */}
      {showMappingDialog && mappingStepIndex !== null && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              파라미터 매핑 - {newInterface.steps[mappingStepIndex].name}
            </h3>

            {/* 파라미터 매핑 캔버스 컴포넌트 */}
            <ParameterMappingDialog />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <Button onClick={() => handleSaveMappings(currentMappings)}>
                저장
              </Button>
              <Button
                onClick={() => {
                  setShowMappingDialog(false);
                  setMappingStepIndex(null);
                }}
                style={{ backgroundColor: '#6c757d' }}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </FullPageContainer>
  );
}
