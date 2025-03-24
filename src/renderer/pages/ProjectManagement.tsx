// src/renderer/pages/ProjectManagement.tsx

import React, { useState, useMemo } from 'react';
import {
  FullPageContainer,
  FlexContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  MainPanel,
  SectionTitle,
  ListItem,
  Input,
  SmallSelect,
  MetaInfo,
  Label,
  Select,
  ButtonGroup,
} from '../styles/CommonStyles';
import Button from '../components/smartButton';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import { ProjectInfo, InterfaceInfo } from '../types';
import { v4 as uuidv4 } from 'uuid';

// 정렬 옵션
type SortType = 'name' | 'createdAt' | 'updatedAt';

// 프로젝트 초깃값
const emptyProject: ProjectInfo = {
  id: '',
  name: '',
  description: '',
  selectedRfc: '',
  selectedDbId: '',
  createdAt: '',
  updatedAt: '',
  interfaceIds: [],
};

// spinner 아이콘 경로 (예: public 폴더에 위치)
const SPINNER_SRC = 'spinner.gif';

export default function ProjectManagement() {
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const { showMessage } = useMessage();

  // 프로젝트 목록 검색/정렬
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 현재 선택된/편집중인 프로젝트
  const [currentProject, setCurrentProject] =
    useState<ProjectInfo>(emptyProject);

  // 프로젝트 삭제 확인 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 인터페이스 목록 검색
  const [interfaceSearch, setInterfaceSearch] = useState('');

  // 실행 관련 State (데모용)
  // - runningIndex: 현재 실행중인 인터페이스의 index
  // - executionResults: 각 인터페이스별 결과 { [interfaceId]: { finished: boolean, finishedTime?: string, error?: string } }
  const [runningIndex, setRunningIndex] = useState<number | null>(null);
  const [executionResults, setExecutionResults] = useState<{
    [key: string]: {
      finished: boolean;
      finishedTime?: string;
      error?: string;
    };
  }>({});

  // 실행 로그
  const [logs, setLogs] = useState<string[]>([]);

  // Settings에 저장된 프로젝트 목록
  const projects = settings.projects || [];

  // 선택된 ProjectId가 바뀔 때마다 currentProject 동기화
  React.useEffect(() => {
    if (settings.selectedProjectId) {
      const found = projects.find((p) => p.id === settings.selectedProjectId);
      if (found) setCurrentProject(found);
    } else {
      setCurrentProject(emptyProject);
    }
  }, [settings.selectedProjectId, projects]);

  // -------------------------
  // 프로젝트 목록 필터+정렬
  // -------------------------
  const sortedFilteredProjects = useMemo(() => {
    const filtered = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortType === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortType === 'createdAt') {
        valA = a.createdAt;
        valB = b.createdAt;
      } else {
        valA = a.updatedAt;
        valB = b.updatedAt;
      }

      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [projects, searchTerm, sortType, sortDirection]);

  // -------------------------
  // 날짜포맷
  // -------------------------
  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // -------------------------
  // 프로젝트 선택
  // -------------------------
  const handleSelectProject = (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      updateSettings({ selectedProjectId: id });
    }
  };

  // -------------------------
  // 프로젝트 추가
  // -------------------------
  const handleAddProject = () => {
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newId = uuidv4();

    // 중복 검사
    const isDuplicate = projects.some((p) => p.name === currentProject.name);
    if (isDuplicate) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const newProj: ProjectInfo = {
      ...currentProject,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    updateSettings((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
      selectedProjectId: newId,
    }));
    setCurrentProject(newProj);
    showMessage('프로젝트가 추가되었습니다.', 'success');
  };

  // -------------------------
  // 프로젝트 수정
  // -------------------------
  const handleUpdateProject = () => {
    if (!currentProject.id) {
      showMessage('수정할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }

    // 중복 검사 (자기 자신 제외)
    const isDuplicate = projects.some(
      (p) => p.name === currentProject.name && p.id !== currentProject.id
    );
    if (isDuplicate) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const updatedProj = { ...currentProject, updatedAt: now };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProj.id ? updatedProj : p
      ),
    }));
    setCurrentProject(updatedProj);
    showMessage('프로젝트가 수정되었습니다.', 'success');
  };

  // -------------------------
  // 프로젝트 삭제
  // -------------------------
  const handleDeleteProjectClick = () => {
    if (!currentProject.id) {
      showMessage('삭제할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteProject = () => {
    if (!currentProject.id) return;
    const updated = projects.filter((p) => p.id !== currentProject.id);

    updateSettings({
      projects: updated,
      selectedProjectId: updated.length > 0 ? updated[0].id : '',
    });
    setShowDeleteConfirm(false);
    showMessage('프로젝트가 삭제되었습니다.', 'success');

    if (updated.length > 0) setCurrentProject(updated[0]);
    else setCurrentProject(emptyProject);
  };

  // -------------------------
  // 인터페이스 목록 필터 (왼쪽)
  // -------------------------
  const allInterfaces = settings.interfaces || [];
  const includedIds = currentProject.interfaceIds || [];

  const filteredInterfaces = useMemo(() => {
    return allInterfaces
      .filter((inf) =>
        inf.name.toLowerCase().includes(interfaceSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allInterfaces, interfaceSearch]);

  // -------------------------
  // 인터페이스 추가 / 제거
  // -------------------------
  const handleAddInterfaceToProject = (infId: string) => {
    if (!currentProject.id) {
      showMessage('프로젝트를 먼저 선택하세요.', 'error');
      return;
    }
    if (includedIds.includes(infId)) {
      showMessage('이미 추가된 인터페이스입니다.', 'warning');
      return;
    }

    const updatedProj = {
      ...currentProject,
      interfaceIds: [...includedIds, infId],
      updatedAt: new Date().toISOString(),
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProj.id ? updatedProj : p
      ),
    }));
    setCurrentProject(updatedProj);
    showMessage('인터페이스를 프로젝트에 추가했습니다.', 'success');
  };

  const handleRemoveInterfaceFromProject = (infId: string) => {
    if (!currentProject.id) return;
    const updatedProj = {
      ...currentProject,
      interfaceIds: includedIds.filter((id) => id !== infId),
      updatedAt: new Date().toISOString(),
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProj.id ? updatedProj : p
      ),
    }));
    setCurrentProject(updatedProj);
    showMessage('해당 인터페이스를 제거했습니다.', 'success');
  };

  // -------------------------
  // 순서 변경
  // -------------------------
  const moveInterfaceUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...includedIds];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    saveOrder(arr);
  };
  const moveInterfaceDown = (index: number) => {
    if (index >= includedIds.length - 1) return;
    const arr = [...includedIds];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    saveOrder(arr);
  };
  const saveOrder = (newOrder: string[]) => {
    const updatedProj = {
      ...currentProject,
      interfaceIds: newOrder,
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProj.id ? updatedProj : p
      ),
    }));
    setCurrentProject(updatedProj);
  };

  // -------------------------
  // 프로젝트에 포함된 인터페이스 (오른쪽 테이블)
  // -------------------------
  const projectInterfaces: InterfaceInfo[] = includedIds
    .map((id) => allInterfaces.find((inf) => inf.id === id))
    .filter(Boolean) as InterfaceInfo[];

  // -------------------------
  // 실행 로직 (데모 예시)
  // -------------------------
  // 전체 실행
  const runAllInterfaces = async () => {
    if (!projectInterfaces.length) {
      showMessage('추가된 인터페이스가 없습니다.', 'info');
      return;
    }
    setLogs([]);
    for (let i = 0; i < projectInterfaces.length; i++) {
      await runSingleInterface(projectInterfaces[i], i);
    }
    showMessage('전체 인터페이스 실행이 완료되었습니다.', 'success');
  };

  // 단일 실행 (데모)
  const runSingleInterface = async (inf: InterfaceInfo, idx: number) => {
    // 실행중 표시
    setRunningIndex(idx);
    setExecutionResults((prev) => ({
      ...prev,
      [inf.id]: { finished: false },
    }));

    setLogs((prev) => [...prev, `[${inf.name}] 실행 시작`]);

    // 대기 (예시로 2초)
    await new Promise((res) => setTimeout(res, 2000));

    // 결과 처리
    const isError = Math.random() < 0.3; // 30% 확률로 에러 (데모)
    setRunningIndex(null);
    setExecutionResults((prev) => ({
      ...prev,
      [inf.id]: {
        finished: true,
        finishedTime: new Date().toLocaleString(),
        error: isError ? 'Random error' : undefined,
      },
    }));
    setLogs((prev) => [
      ...prev,
      `[${inf.name}] 실행 ${
        isError ? '실패' : '성공'
      } (${new Date().toLocaleTimeString()})`,
    ]);
  };

  if (isLoading) {
    return <div>프로젝트 정보를 불러오는 중...</div>;
  }

  return (
    <FullPageContainer>
      <FlexContainer style={{ height: '100%' }}>
        {/* 좌측: 프로젝트 목록 */}
        <SidePanel>
          <SidePanelHeader>
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                style={{ width: '70px', marginRight: '5px' }}
              >
                <option value="name">이름</option>
                <option value="createdAt">생성</option>
                <option value="updatedAt">수정</option>
              </SmallSelect>
              <Button
                onClick={() =>
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                }
                style={{ padding: '3px 6px' }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </SidePanelHeader>

          <SidePanelContent>
            {sortedFilteredProjects.length === 0 ? (
              <div
                style={{ padding: '10px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 프로젝트가 없습니다.'}
              </div>
            ) : (
              sortedFilteredProjects.map((project) => (
                <ListItem
                  key={project.id}
                  active={project.id === currentProject.id}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <strong>{project.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#777' }}>
                    {project.description.slice(0, 30)}
                    {project.description.length > 30 ? '...' : ''}
                  </div>
                  <MetaInfo>
                    생성: {formatDateTime(project.createdAt)} <br />
                    수정: {formatDateTime(project.updatedAt)}
                  </MetaInfo>
                </ListItem>
              ))
            )}
          </SidePanelContent>
        </SidePanel>

        {/* 메인 영역 */}
        <MainPanel style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 상단: 프로젝트 정보 간략 배치 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: '10px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px',
            }}
          >
            {/* 왼쪽 입력영역 */}
            <div style={{ flex: '1 1 auto' }}>
              <SectionTitle style={{ marginBottom: '8px' }}>
                프로젝트 정보
              </SectionTitle>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}
              >
                {/* 프로젝트 이름 */}
                <div style={{ flex: 1 }}>
                  <Label>프로젝트 이름</Label>
                  <Input
                    value={currentProject.name}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        name: e.target.value,
                      })
                    }
                    placeholder="예) 테스트 프로젝트"
                  />
                </div>
                {/* 설명 */}
                <div style={{ flex: 2 }}>
                  <Label>설명</Label>
                  <Input
                    value={currentProject.description}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="프로젝트에 대한 설명"
                  />
                </div>
              </div>

              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}
              >
                {/* RFC 연결 */}
                <div style={{ flex: 1 }}>
                  <Label>RFC 연결</Label>
                  <Select
                    value={currentProject.selectedRfc}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        selectedRfc: e.target.value,
                      })
                    }
                  >
                    <option value="">선택</option>
                    {(settings.rfcConnections || []).map((rfc) => (
                      <option
                        key={rfc.connectionName}
                        value={rfc.connectionName}
                      >
                        {rfc.connectionName}
                      </option>
                    ))}
                  </Select>
                </div>
                {/* DB 연결 */}
                <div style={{ flex: 1 }}>
                  <Label>DB 연결</Label>
                  <Select
                    value={currentProject.selectedDbId}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        selectedDbId: e.target.value,
                      })
                    }
                  >
                    <option value="">선택</option>
                    {(settings.dbConnections || []).map((db) => (
                      <option key={db.id} value={db.id}>
                        {db.connectionName}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* 오른쪽: 생성/수정 + 버튼 */}
            <div style={{ flex: '0 0 auto', marginLeft: 'auto' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  textAlign: 'right',
                }}
              >
                <div>생성: {formatDateTime(currentProject.createdAt)}</div>
                <div>수정: {formatDateTime(currentProject.updatedAt)}</div>
              </div>
              <div style={{ marginTop: '10px', textAlign: 'right' }}>
                {!currentProject.id ? (
                  <Button onClick={handleAddProject}>프로젝트 추가</Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdateProject}
                      style={{ marginRight: '5px' }}
                    >
                      프로젝트 수정
                    </Button>
                    <Button
                      onClick={handleDeleteProjectClick}
                      style={{ backgroundColor: '#e74c3c' }}
                    >
                      프로젝트 삭제
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 하단: 프로젝트 인터페이스 관리 (좌측: 전체 인터페이스, 우측: 포함된 인터페이스 + 터미널) */}
          {currentProject.id && (
            <div style={{ flex: '1', display: 'flex', gap: '20px' }}>
              {/* 좌측 인터페이스 목록 */}
              <div
                style={{
                  width: '300px',
                  flexShrink: 0,
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ padding: '10px', borderBottom: '1px solid #eee' }}
                >
                  <strong>인터페이스 목록</strong>
                </div>
                <div style={{ padding: '5px 10px' }}>
                  <Input
                    type="text"
                    placeholder="검색..."
                    value={interfaceSearch}
                    onChange={(e) => setInterfaceSearch(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {filteredInterfaces.length === 0 ? (
                    <div
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#999',
                      }}
                    >
                      {interfaceSearch
                        ? '검색 결과가 없습니다.'
                        : '등록된 인터페이스가 없습니다.'}
                    </div>
                  ) : (
                    filteredInterfaces.map((inf) => {
                      const isIncluded = includedIds.includes(inf.id);
                      return (
                        <ListItem key={inf.id} active={false}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                            }}
                          >
                            <span>{inf.name}</span>
                            {!isIncluded && (
                              <Button
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.8rem',
                                }}
                                onClick={() =>
                                  handleAddInterfaceToProject(inf.id)
                                }
                              >
                                추가
                              </Button>
                            )}
                          </div>
                        </ListItem>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 우측: 프로젝트에 포함된 인터페이스 + 터미널 */}
              <div
                style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* 상단 헤더 (테이블 + 전체 실행 버튼) */}
                <div
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <strong>프로젝트에 포함된 인터페이스</strong>
                  <Button
                    style={{ marginLeft: 'auto' }}
                    onClick={runAllInterfaces}
                  >
                    전체 실행
                  </Button>
                </div>

                {/* 인터페이스 테이블 */}
                <div style={{ padding: '10px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <th style={{ textAlign: 'left', padding: '5px' }}>
                          이름
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '5px',
                            width: '120px',
                          }}
                        >
                          동작상태
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '5px',
                            width: '140px',
                          }}
                        >
                          최종성공시간
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '5px',
                            width: '110px',
                          }}
                        >
                          최종결과
                        </th>
                        <th
                          style={{
                            textAlign: 'right',
                            padding: '5px',
                            width: '120px',
                          }}
                        >
                          순서/삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectInterfaces.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: 'center',
                              padding: '10px',
                              color: '#999',
                            }}
                          >
                            아직 추가된 인터페이스가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        projectInterfaces.map((inf, idx) => {
                          const isRunning = runningIndex === idx;
                          const result = executionResults[inf.id] || {};
                          const hasError = !!result.error;

                          return (
                            <tr
                              key={inf.id}
                              style={{ borderBottom: '1px solid #eee' }}
                            >
                              {/* 이름 */}
                              <td style={{ padding: '5px' }}>{inf.name}</td>

                              {/* 동작상태: 스피너 or 완료 */}
                              <td style={{ padding: '5px' }}>
                                {isRunning ? (
                                  <img
                                    src={SPINNER_SRC}
                                    alt="loading"
                                    style={{
                                      width: '20px',
                                      verticalAlign: 'middle',
                                    }}
                                  />
                                ) : result.finished ? (
                                  '완료'
                                ) : (
                                  '-'
                                )}
                              </td>

                              {/* 최종성공시간 */}
                              <td style={{ padding: '5px' }}>
                                {result.finishedTime || '-'}
                              </td>

                              {/* 최종결과 */}
                              <td style={{ padding: '5px' }}>
                                {!result.finished ? (
                                  '-'
                                ) : hasError ? (
                                  <span
                                    style={{
                                      backgroundColor: '#ffdddd',
                                      padding: '2px 4px',
                                    }}
                                  >
                                    X
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      backgroundColor: '#ddffdd',
                                      padding: '2px 4px',
                                    }}
                                  >
                                    O
                                  </span>
                                )}
                              </td>

                              {/* 순서변경/삭제 (우측 정렬) */}
                              <td
                                style={{ textAlign: 'right', padding: '5px' }}
                              >
                                <Button
                                  onClick={() => moveInterfaceUp(idx)}
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '0.8rem',
                                    marginRight: '3px',
                                  }}
                                >
                                  ↑
                                </Button>
                                <Button
                                  onClick={() => moveInterfaceDown(idx)}
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '0.8rem',
                                    marginRight: '3px',
                                  }}
                                >
                                  ↓
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleRemoveInterfaceFromProject(inf.id)
                                  }
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '0.8rem',
                                    backgroundColor: '#e74c3c',
                                  }}
                                >
                                  삭제
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 터미널(로그) 영역 */}
                <div
                  style={{
                    flex: '1',
                    borderTop: '1px solid #eee',
                    padding: '10px',
                    overflow: 'auto',
                  }}
                >
                  <div
                    style={{
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <strong>실행 로그</strong>
                    <Button
                      onClick={() => setLogs([])}
                      style={{ backgroundColor: '#6c757d', fontSize: '0.8rem' }}
                    >
                      로그 지우기
                    </Button>
                  </div>
                  <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                    {logs.length === 0 ? (
                      <div style={{ color: '#999' }}>로그가 없습니다.</div>
                    ) : (
                      logs.map((line, i) => <div key={i}>{line}</div>)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </MainPanel>
      </FlexContainer>

      {/* 프로젝트 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <h4>프로젝트 삭제</h4>
            <p style={{ marginTop: '10px', marginBottom: '20px' }}>
              프로젝트 "{currentProject.name}"를 정말 삭제하시겠습니까?
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                취소
              </Button>
              <Button
                onClick={handleDeleteProject}
                style={{ backgroundColor: '#e74c3c' }}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </FullPageContainer>
  );
}
