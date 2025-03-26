// src/renderer/pages/ProjectManagement.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  FullPageContainer,
  FlexContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  MainPanel,
  ListItem,
  Input,
  MetaInfo,
  Select,
  LeftAlignedLabel,
} from '../styles/CommonStyles';
import Button from '../components/smartButton';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import {
  ProjectInfo,
  InterfaceInfo,
  ProjectInterfaceConfig,
  formatDateTime,
  SortType,
  globalStyles,
  spinnerStyle,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { FiLoader, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import LogDisplay from '../components/LogDisplay'; // LogDisplay 컴포넌트 임포트

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
  autoRun: false,
};

export default function ProjectManagement() {
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const { showMessage } = useMessage();
  const [intervalIds, setIntervalIds] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [tempProjectName, setTempProjectName] = useState('');
  const [tempProjectDesc, setTempProjectDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentProject, setCurrentProject] =
    useState<ProjectInfo>(emptyProject);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [interfaceSearch, setInterfaceSearch] = useState('');
  const [executionResults, setExecutionResults] = useState<{
    [key: string]: { finished: boolean; finishedTime?: string; error?: string };
  }>({});
  const [logs, setLogs] = useState<
    { level: string; timestamp: string; message: string; details?: any }[]
  >([]);

  // @keyframes spin 등록
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const projects = settings.projects || [];

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

  const handleSelectProject = (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      setTempProjectName(found.name);
      setTempProjectDesc(found.description);
      updateSettings({ selectedProjectId: id });
    }
  };

  const Switch = ({
    isOn,
    toggleSwitch,
  }: {
    isOn: boolean;
    toggleSwitch: () => void;
  }) => {
    return (
      <div
        onClick={toggleSwitch}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          marginTop: '-10px',
        }}
      >
        {isOn ? (
          <FiToggleRight size={40} color="green" />
        ) : (
          <FiToggleLeft size={40} color="gray" />
        )}
      </div>
    );
  };

  const toggleAutoRun = (projectId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const updatedProject = { ...p, autoRun: !p.autoRun };
        if (updatedProject.autoRun) {
          runInterfacesWithSchedule();
        } else {
          Object.values(intervalIds).forEach((intervalId) =>
            clearInterval(intervalId)
          );
          setIntervalIds({});
        }
        return updatedProject;
      }
      return p;
    });
    updateSettings({ projects: updated });
  };

  const appendLog = (level: string, message: string, details?: any) => {
    const newLog = {
      level,
      timestamp: new Date().toISOString(),
      message,
      details,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleAddProject = () => {
    if (!tempProjectName.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }
    const isDup = projects.some((p) => p.name === tempProjectName);
    if (isDup) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newId = uuidv4();
    const newProj: ProjectInfo = {
      id: newId,
      name: tempProjectName,
      description: tempProjectDesc,
      selectedRfc: '',
      selectedDbId: '',
      createdAt: now,
      updatedAt: now,
      interfaceConfigs: [],
      autoRun: false,
    };

    updateSettings((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
      selectedProjectId: newId,
    }));

    setCurrentProject(newProj);
    showMessage('프로젝트가 추가되었습니다.', 'success');
  };

  const handleUpdateProject = () => {
    if (!currentProject.id) {
      showMessage('수정할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    if (!tempProjectName.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }
    const isDup = projects.some(
      (p) => p.name === tempProjectName && p.id !== currentProject.id
    );
    if (isDup) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const updatedProj: ProjectInfo = {
      ...currentProject,
      name: tempProjectName,
      description: tempProjectDesc,
      updatedAt: now,
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProj.id ? updatedProj : p
      ),
    }));

    setCurrentProject(updatedProj);
    showMessage('프로젝트가 수정되었습니다.', 'success');
  };

  const handleNewProject = () => {
    setCurrentProject(emptyProject);
    setTempProjectName('');
    setTempProjectDesc('');
    updateSettings({ selectedProjectId: '' });
  };

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

    if (updated.length > 0) {
      setCurrentProject(updated[0]);
      setTempProjectName(updated[0].name);
      setTempProjectDesc(updated[0].description);
    } else {
      setCurrentProject(emptyProject);
      setTempProjectName('');
      setTempProjectDesc('');
    }
  };

  const allInterfaces = settings.interfaces || [];
  const interfaceConfigs = currentProject.interfaceConfigs || [];

  const filteredInterfaces = useMemo(() => {
    return allInterfaces
      .filter((inf) =>
        inf.name.toLowerCase().includes(interfaceSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allInterfaces, interfaceSearch]);

  const saveProject = (proj: ProjectInfo) => {
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) => (p.id === proj.id ? proj : p)),
    }));
    setCurrentProject(proj);
  };

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
      scheduleSec: 0, // 기본
    };
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: [...interfaceConfigs, newConfig],
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
    showMessage('인터페이스를 프로젝트에 추가했습니다.', 'success');
  };

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

  const handleToggleAll = (checked: boolean) => {
    const arr = interfaceConfigs.map((c) => ({ ...c, enabled: checked }));
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  const handleScheduleChange = (index: number, schedule: number) => {
    const arr = [...interfaceConfigs];
    arr[index] = { ...arr[index], scheduleSec: schedule };
    const updatedProj = {
      ...currentProject,
      interfaceConfigs: arr,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProj);
  };

  const projectInterfaces: Array<{
    config: ProjectInterfaceConfig;
    info: InterfaceInfo | null;
  }> = interfaceConfigs.map((cfg) => ({
    config: cfg,
    info: allInterfaces.find((inf) => inf.id === cfg.id) || null,
  }));

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

  const runInterfacesWithSchedule = () => {
    const enabledInterfaces = projectInterfaces.filter((p) => p.config.enabled);

    const promises = enabledInterfaces.map((interfaceItem, idx) => {
      const { config, info } = interfaceItem;

      if (!info) return Promise.resolve();

      return runSingleInterface(info, idx).then(() => {
        const intervalId = setInterval(() => {
          runSingleInterface(info, idx);
        }, config.scheduleSec * 1000);

        setIntervalIds((prev) => ({
          ...prev,
          [info.id]: intervalId,
        }));
      });
    });

    Promise.all(promises).then(() => {
      console.log('모든 인터페이스 실행 완료');
    });
  };

  const runSingleInterface = async (inf: InterfaceInfo, idx: number) => {
    appendLog('info', `[${inf.name}] 실행 시작`);

    setExecutionResults((prev) => ({
      ...prev,
      [inf.id]: { finished: false },
    }));

    await new Promise((res) => setTimeout(res, 1500));

    const isError = Math.random() < 0.3; // 무작위 에러 발생

    setExecutionResults((prev) => ({
      ...prev,
      [inf.id]: {
        finished: true,
        finishedTime: new Date().toLocaleString(),
        error: isError ? 'Random error' : undefined,
      },
    }));

    appendLog('success', `[${inf.name}] 실행 ${isError ? '실패' : '성공'}`);
  };

  const showSpinner = (config: ProjectInterfaceConfig, idx: number) => {
    const result = executionResults[config.id];
    const isRunning = result && !result.finished;
    return config.enabled && isRunning ? (
      <FiLoader style={spinnerStyle} size={18} />
    ) : null;
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
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <strong>{project.name}</strong>
                        {/* 자동실행 여부 스위치 추가 */}
                        <Switch
                          isOn={project.autoRun}
                          toggleSwitch={() => toggleAutoRun(project.id)}
                        />
                      </div>

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
                  {/* 프로젝트 이름 */}
                  <div
                    style={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                    }}
                  >
                    <LeftAlignedLabel>프로젝트 이름</LeftAlignedLabel>
                    <Input
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={tempProjectName}
                      onChange={(e) => setTempProjectName(e.target.value)}
                      placeholder="예) 테스트 프로젝트"
                    />
                  </div>

                  {/* 프로젝트 설명 */}
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
                      value={tempProjectDesc}
                      onChange={(e) => setTempProjectDesc(e.target.value)}
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
                      프로젝트 추가
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
                      <Button
                        style={{ marginLeft: 'auto', marginRight: '10px' }}
                        onClick={runAllInterfaces}
                      >
                        전체 실행
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
                    <div
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {/* <strong></strong> */}
                    </div>

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
                              자동실행(s)
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
                              const result = executionResults[config.id] || {};
                              const hasError = !!result.error;

                              return (
                                <tr
                                  key={config.id}
                                  style={{ borderBottom: '1px solid #eee' }}
                                >
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {idx + 1}
                                  </td>
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
                                  <td style={{ padding: '5px' }}>
                                    {info ? info.name : '(알 수 없음)'}
                                  </td>
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {!config.enabled
                                      ? '미사용'
                                      : showSpinner(config, idx) ||
                                        (result.finished ? '대기' : '-')}
                                  </td>
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <input
                                      aria-label="자동실행 시간"
                                      type="number"
                                      style={{
                                        width: '60px',
                                        textAlign: 'right',
                                      }}
                                      value={config.scheduleSec}
                                      min={0}
                                      onChange={(e) =>
                                        handleScheduleChange(
                                          idx,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </td>
                                  <td
                                    style={{
                                      padding: '5px',
                                      textAlign: 'center',
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    {result.finishedTime || '-'}
                                  </td>
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
                                  <td
                                    style={{
                                      textAlign: 'right',
                                      padding: '0px',
                                    }}
                                  >
                                    <div
                                      style={{ display: 'flex', gap: '3px' }}
                                    >
                                      <Button
                                        onClick={() => moveInterfaceUp(idx)}
                                        style={{
                                          padding: '2px 4px',
                                          fontSize: '0.8rem',
                                          marginRight: '3px',
                                        }}
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        onClick={() => moveInterfaceDown(idx)}
                                        style={{
                                          padding: '2px 4px',
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
                                    </div>
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
          <LogDisplay logs={logs} clearLogs={clearLogs} />
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
