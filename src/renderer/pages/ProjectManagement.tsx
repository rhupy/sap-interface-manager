// src/renderer/pages/ProjectManagement.tsx

import React, { useState, useMemo, useEffect } from 'react';
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
  LeftAlignedLabel,
} from '../styles/CommonStyles';
import Button from '../components/smartButton';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import { ProjectInfo, InterfaceInfo, ProjectInterfaceConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { FiLoader } from 'react-icons/fi';

// 로딩 아이콘 회전 애니메이션
const spinnerStyle: React.CSSProperties = {
  animation: 'spin 1s linear infinite',
};
// globalStyles: @keyframes spin
const globalStyles = `
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
`;

type SortType = 'name' | 'createdAt' | 'updatedAt';

// ProjectInfo 기본값
const emptyProject: ProjectInfo = {
  id: '',
  name: '',
  description: '',
  selectedRfc: '',
  selectedDbId: '',
  createdAt: '',
  updatedAt: '',
  interfaceConfigs: [], // 실제 사용
};

export default function ProjectManagement() {
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const { showMessage } = useMessage();

  // 프로젝트 목록 검색/정렬
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 현재 선택/편집 프로젝트
  const [currentProject, setCurrentProject] =
    useState<ProjectInfo>(emptyProject);
  // 삭제 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 인터페이스 목록 검색
  const [interfaceSearch, setInterfaceSearch] = useState('');

  // 실행(데모)
  const [runningIndex, setRunningIndex] = useState<number | null>(null);
  const [executionResults, setExecutionResults] = useState<{
    [key: string]: {
      finished: boolean;
      finishedTime?: string;
      error?: string;
    };
  }>({});
  const [logs, setLogs] = useState<string[]>([]);

  // @keyframes spin 등록
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Settings에서 project 목록
  const projects = settings.projects || [];

  // selectedProjectId 변화 시 currentProject 동기화
  useEffect(() => {
    if (settings.selectedProjectId) {
      const found = projects.find((p) => p.id === settings.selectedProjectId);
      if (found) setCurrentProject(found);
    } else {
      setCurrentProject(emptyProject);
    }
  }, [settings.selectedProjectId, projects]);

  // 날짜 포맷
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

  // 프로젝트 목록 필터+정렬
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

  // 프로젝트 선택
  const handleSelectProject = (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      updateSettings({ selectedProjectId: id });
    }
  };

  // 프로젝트 추가
  const handleAddProject = () => {
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }
    // 중복 검사
    const isDup = projects.some((p) => p.name === currentProject.name);
    if (isDup) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newId = uuidv4();
    const newProj: ProjectInfo = {
      ...currentProject,
      id: newId,
      createdAt: now,
      updatedAt: now,
      interfaceConfigs: [],
    };
    updateSettings((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
      selectedProjectId: newId,
    }));
    setCurrentProject(newProj);
    showMessage('프로젝트가 추가되었습니다.', 'success');
  };

  // 프로젝트 수정
  const handleUpdateProject = () => {
    if (!currentProject.id) {
      showMessage('수정할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }
    // 중복 이름 검사 (자기 자신 제외)
    const isDup = projects.some(
      (p) => p.name === currentProject.name && p.id !== currentProject.id
    );
    if (isDup) {
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

  // 프로젝트 삭제
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

  // 전체 인터페이스 목록
  const allInterfaces = settings.interfaces || [];
  // 현재 프로젝트의 interfaceConfigs
  const interfaceConfigs = currentProject.interfaceConfigs || [];

  // 좌측 목록에서 검색
  const filteredInterfaces = useMemo(() => {
    return allInterfaces
      .filter((inf) =>
        inf.name.toLowerCase().includes(interfaceSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allInterfaces, interfaceSearch]);

  // interfaceConfigs 업데이트 헬퍼
  const saveProject = (proj: ProjectInfo) => {
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) => (p.id === proj.id ? proj : p)),
    }));
    setCurrentProject(proj);
  };

  // 인터페이스 추가
  const handleAddInterfaceToProject = (infId: string) => {
    if (!currentProject.id) {
      showMessage('프로젝트를 먼저 선택하세요.', 'error');
      return;
    }
    const exists = interfaceConfigs.some((c) => c.id === infId);
    if (exists) {
      showMessage('이미 추가된 인터페이스입니다.', 'warning');
      return;
    }

    const newConfig: ProjectInterfaceConfig = {
      id: infId,
      enabled: true,
      scheduleMin: 0, // 기본
    };
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: [...interfaceConfigs, newConfig],
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
    showMessage('인터페이스를 프로젝트에 추가했습니다.', 'success');
  };

  // 인터페이스 제거
  const handleRemoveInterfaceFromProject = (infId: string) => {
    if (!currentProject.id) return;
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: interfaceConfigs.filter((c) => c.id !== infId),
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
    showMessage('해당 인터페이스를 제거했습니다.', 'success');
  };

  // 순서변경
  const moveInterfaceUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...interfaceConfigs];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };
  const moveInterfaceDown = (index: number) => {
    if (index >= interfaceConfigs.length - 1) return;
    const arr = [...interfaceConfigs];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  // 활성화 체크박스
  const handleToggleEnabled = (index: number, value: boolean) => {
    const arr = [...interfaceConfigs];
    arr[index] = { ...arr[index], enabled: value };
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  // 전체 활성/비활성
  const handleToggleAll = (checked: boolean) => {
    const arr = interfaceConfigs.map((c) => ({ ...c, enabled: checked }));
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  // 자동실행(m)
  const handleScheduleChange = (index: number, schedule: number) => {
    const arr = [...interfaceConfigs];
    arr[index] = { ...arr[index], scheduleMin: schedule };
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  // project.interfaceConfigs => 실제 인터페이스 정보 join
  const projectInterfaces: Array<{
    config: ProjectInterfaceConfig;
    info: InterfaceInfo | null;
  }> = interfaceConfigs.map((cfg) => ({
    config: cfg,
    info: allInterfaces.find((inf) => inf.id === cfg.id) || null,
  }));

  // 실행 로직 (활성화된 인터페이스만)
  const runAllInterfaces = async () => {
    const enabledList = projectInterfaces.filter((p) => p.config.enabled);
    if (!enabledList.length) {
      showMessage('활성화된 인터페이스가 없습니다.', 'info');
      return;
    }
    setLogs([]);
    for (let i = 0; i < enabledList.length; i++) {
      const { info } = enabledList[i];
      if (!info) continue;
      await runSingleInterface(info, i);
    }
    showMessage('전체 인터페이스 실행이 완료되었습니다.', 'success');
  };

  const runSingleInterface = async (inf: InterfaceInfo, idx: number) => {
    setRunningIndex(idx);
    setExecutionResults((prev) => ({
      ...prev,
      [inf.id]: { finished: false },
    }));

    setLogs((prev) => [...prev, `[${inf.name}] 실행 시작`]);
    // 데모: 1.5초 대기
    await new Promise((res) => setTimeout(res, 1500));

    const isError = Math.random() < 0.3; // 30% 에러
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
      `[${inf.name}] 실행 ${isError ? '실패' : '성공'} (${new Date().toLocaleTimeString()})`,
    ]);
  };

  if (isLoading) {
    return <div>프로젝트 정보를 불러오는 중...</div>;
  }

  return (
    <FullPageContainer>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* 왼쪽 UI */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <FlexContainer style={{ height: '100%' }}>
            {/* 왼쪽 패널: 프로젝트 목록 */}
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
                    style={{
                      padding: '10px',
                      textAlign: 'center',
                      color: '#999',
                    }}
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

            {/* 메인 패널: 프로젝트 정보 + 인터페이스 테이블 */}
            <MainPanel style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 컨테이너: 상단 2줄 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '15px',
                  padding: '10px',
                }}
              >
                {/* 첫 줄: 프로젝트 이름 / 설명 / RFC / DB */}
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                  }}
                >
                  {/* 프로젝트 이름 (400px 고정) */}
                  <div
                    style={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                    }}
                  >
                    <LeftAlignedLabel>프로젝트 이름</LeftAlignedLabel>
                    <Input
                      style={{
                        width: '100%',
                        boxSizing: 'border-box', // ← 이 부분이 중요
                      }}
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

                  {/* 설명 (남은 공간을 전부 사용) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <LeftAlignedLabel>설명</LeftAlignedLabel>
                    <Input
                      style={{ width: '100%' }}
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

                  {/* RFC 연결 (150px) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '150px',
                    }}
                  >
                    <LeftAlignedLabel>RFC 연결</LeftAlignedLabel>
                    <Select
                      value={currentProject.selectedRfc}
                      onChange={(e) =>
                        setCurrentProject({
                          ...currentProject,
                          selectedRfc: e.target.value,
                        })
                      }
                      style={{ width: '100%' }}
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

                  {/* DB 연결 (150px) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '150px',
                    }}
                  >
                    <LeftAlignedLabel>DB 연결</LeftAlignedLabel>
                    <Select
                      value={currentProject.selectedDbId}
                      onChange={(e) =>
                        setCurrentProject({
                          ...currentProject,
                          selectedDbId: e.target.value,
                        })
                      }
                      style={{ width: '100%' }}
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

                {/* 두 번째 줄: 버튼들 (오른쪽 정렬) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                  }}
                >
                  {currentProject.id && (
                    <Button
                      style={{ backgroundColor: '#6c757d' }}
                      onClick={() => {
                        setCurrentProject({ ...emptyProject });
                        updateSettings({ selectedProjectId: '' });
                      }}
                    >
                      새 프로젝트
                    </Button>
                  )}

                  {!currentProject.id ? (
                    <Button
                      onClick={handleAddProject}
                      style={{ backgroundColor: '#007bff', color: '#fff' }}
                    >
                      + 프로젝트 추가
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleUpdateProject}
                        style={{ backgroundColor: '#007bff', color: '#fff' }}
                      >
                        프로젝트 수정
                      </Button>
                      <Button
                        onClick={handleDeleteProjectClick}
                        style={{ backgroundColor: '#e74c3c', color: '#fff' }}
                      >
                        프로젝트 삭제
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 하단: 좌(전체인터페이스 목록) + 우(테이블) */}
              {currentProject.id && (
                <div style={{ flex: '1', display: 'flex', gap: '20px' }}>
                  {/* 좌측: 인터페이스 목록 */}
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
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                      }}
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
                          const exists = interfaceConfigs.some(
                            (c) => c.id === inf.id
                          );
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
                                {!exists && (
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

                  {/* 우측: 테이블 */}
                  <div
                    style={{
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* 헤더 */}
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
                        style={{ marginLeft: 'auto', marginRight: '10px' }}
                        onClick={runAllInterfaces}
                      >
                        전체 실행
                      </Button>
                    </div>

                    {/* 테이블 */}
                    <div style={{ padding: '10px', overflowY: 'auto' }}>
                      <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <th style={{ width: '40px', padding: '5px' }}>
                              순번
                            </th>
                            <th
                              style={{
                                width: '60px',
                                padding: '5px',
                                textAlign: 'center',
                              }}
                            >
                              <input
                                aria-label="전체 선택"
                                type="checkbox"
                                checked={
                                  interfaceConfigs.length > 0 &&
                                  interfaceConfigs.every((c) => c.enabled)
                                }
                                onChange={(e) =>
                                  handleToggleAll(e.target.checked)
                                }
                              />
                            </th>
                            <th style={{ textAlign: 'left', padding: '5px' }}>
                              이름
                            </th>
                            <th style={{ width: '80px', padding: '5px' }}>
                              동작상태
                            </th>
                            <th style={{ width: '100px', padding: '5px' }}>
                              자동실행(m)
                            </th>
                            <th style={{ width: '140px', padding: '5px' }}>
                              최종성공시간
                            </th>
                            <th style={{ width: '90px', padding: '5px' }}>
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
                                colSpan={8}
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
                            projectInterfaces.map(({ config, info }, idx) => {
                              const isRunning = runningIndex === idx;
                              const result = executionResults[config.id] || {};
                              const hasError = !!result.error;
                              const showSpinner = config.enabled && isRunning;

                              return (
                                <tr
                                  key={config.id}
                                  style={{ borderBottom: '1px solid #eee' }}
                                >
                                  {/* 순번 */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {idx + 1}
                                  </td>
                                  {/* 활성화 */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <input
                                      aria-label="인터페이스 활성화"
                                      type="checkbox"
                                      checked={config.enabled}
                                      onChange={(e) =>
                                        handleToggleEnabled(
                                          idx,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                  {/* 이름 */}
                                  <td style={{ padding: '5px' }}>
                                    {info ? info.name : '(알 수 없음)'}
                                  </td>
                                  {/* 동작상태 */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {!config.enabled ? (
                                      '미사용'
                                    ) : showSpinner ? (
                                      <FiLoader
                                        style={spinnerStyle}
                                        size={18}
                                      />
                                    ) : result.finished ? (
                                      '완료'
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  {/* 자동실행(m) */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <input
                                      aria-label="자동실행 시간"
                                      type="number"
                                      style={{ width: '60px' }}
                                      value={config.scheduleMin}
                                      min={0}
                                      onChange={(e) =>
                                        handleScheduleChange(
                                          idx,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </td>
                                  {/* 최종성공시간 */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {result.finishedTime || '-'}
                                  </td>
                                  {/* 최종결과 */}
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
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
                                  {/* 순서/삭제 */}
                                  <td
                                    style={{
                                      textAlign: 'right',
                                      padding: '5px',
                                    }}
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
                                        handleRemoveInterfaceFromProject(
                                          config.id
                                        )
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
                  </div>
                </div>
              )}
            </MainPanel>
          </FlexContainer>
        </div>

        {/* 오른쪽: 실행 로그 전체 높이 */}
        <div
          style={{
            width: '400px',
            borderLeft: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <strong>실행 로그</strong>
            <Button
              style={{ backgroundColor: '#6c757d', fontSize: '0.8rem' }}
              onClick={() => setLogs([])}
            >
              로그 지우기
            </Button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px',
              fontSize: '0.85rem',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#999' }}>로그가 없습니다.</div>
            ) : (
              logs.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </div>
      </div>

      {/* 프로젝트 삭제 모달 */}
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
