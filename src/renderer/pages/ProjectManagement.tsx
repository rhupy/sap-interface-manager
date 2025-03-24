// src/renderer/pages/ProjectManagement.tsx

import React, { useState, useMemo } from 'react';
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
  SmallSelect,
  MetaInfo,
  Label,
  LeftAlignedLabel,
  Select,
  ButtonGroup,
} from '../styles/CommonStyles';
import Button from '../components/smartButton';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import { ProjectInfo, InterfaceInfo } from '../types';
import { v4 as uuidv4 } from 'uuid';

type SortType = 'name' | 'createdAt' | 'updatedAt';

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

export default function ProjectManagement() {
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const { showMessage } = useMessage();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 현재 편집중인 프로젝트
  const [currentProject, setCurrentProject] =
    useState<ProjectInfo>(emptyProject);
  // 삭제 확인 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 프로젝트 목록
  const projects = settings.projects || [];

  // 선택된 프로젝트가 있으면 currentProject 동기화
  // (프로젝트 추가/삭제 직후에도 반영되도록)
  React.useEffect(() => {
    if (settings.selectedProjectId) {
      const found = projects.find((p) => p.id === settings.selectedProjectId);
      if (found) setCurrentProject(found);
    } else {
      setCurrentProject(emptyProject);
    }
  }, [settings.selectedProjectId, projects]);

  // 프로젝트 선택
  const handleSelectProject = (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      updateSettings({ selectedProjectId: id });
    }
  };

  // 프로젝트 목록 정렬 및 필터링
  const sortedFilteredProjects = useMemo(() => {
    const filtered = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA = '',
        valB = '';
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

  // 새 프로젝트 or 수정
  const handleAddProject = () => {
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newId = uuidv4();
    const newProject: ProjectInfo = {
      ...currentProject,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    // 중복 이름 검사
    const isDuplicate = projects.some((p) => p.name === newProject.name);
    if (isDuplicate) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    updateSettings((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProject],
      selectedProjectId: newId,
    }));
    setCurrentProject(newProject);
    showMessage('프로젝트가 추가되었습니다.', 'success');
  };

  const handleUpdateProject = () => {
    if (!currentProject.id) {
      showMessage('수정할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }

    const now = new Date().toISOString();
    // 중복 이름 검사 (자기 자신 제외)
    const isDuplicate = projects.some(
      (p) => p.name === currentProject.name && p.id !== currentProject.id
    );
    if (isDuplicate) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const updated = { ...currentProject, updatedAt: now };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    setCurrentProject(updated);
    showMessage('프로젝트가 수정되었습니다.', 'success');
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

    if (updated.length > 0) setCurrentProject(updated[0]);
    else setCurrentProject(emptyProject);
  };

  // 포맷팅
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

  // --------------------------------------
  // 인터페이스 추가 부분
  // --------------------------------------

  // 전체 인터페이스 목록 (InterfaceManagement에 있는 것)
  const allInterfaces = settings.interfaces || [];

  // 좌측 패널용 검색
  const [interfaceSearch, setInterfaceSearch] = useState('');

  // 정렬 (이름순 고정, 필요시 옵션 가능)
  const filteredInterfaces = useMemo(() => {
    return allInterfaces
      .filter((inf) =>
        inf.name.toLowerCase().includes(interfaceSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allInterfaces, interfaceSearch]);

  // 현재 프로젝트에 이미 포함된 인터페이스 ID
  const includedIds = currentProject.interfaceIds || [];

  // 프로젝트에 인터페이스 추가
  const handleAddInterfaceToProject = (infId: string) => {
    if (!currentProject.id) {
      showMessage('프로젝트를 먼저 선택하세요.', 'error');
      return;
    }
    if (includedIds.includes(infId)) {
      showMessage('이미 추가된 인터페이스입니다.', 'warning');
      return;
    }

    const updated = {
      ...currentProject,
      interfaceIds: [...includedIds, infId],
      updatedAt: new Date().toISOString(),
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    setCurrentProject(updated);
    showMessage('인터페이스를 프로젝트에 추가했습니다.', 'success');
  };

  // 프로젝트에서 제거
  const handleRemoveInterfaceFromProject = (infId: string) => {
    if (!currentProject.id) return;
    const updated = {
      ...currentProject,
      interfaceIds: includedIds.filter((id) => id !== infId),
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    setCurrentProject(updated);
    showMessage('해당 인터페이스를 제거했습니다.', 'success');
  };

  // 순서 이동
  const moveInterfaceUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...includedIds];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    const updated = {
      ...currentProject,
      interfaceIds: arr,
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    setCurrentProject(updated);
  };
  const moveInterfaceDown = (index: number) => {
    if (index >= includedIds.length - 1) return;
    const arr = [...includedIds];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    const updated = {
      ...currentProject,
      interfaceIds: arr,
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    setCurrentProject(updated);
  };

  // 우측 패널에 표시할 실제 인터페이스 정보
  const projectInterfaces: InterfaceInfo[] = includedIds
    .map((id) => allInterfaces.find((inf) => inf.id === id))
    .filter(Boolean) as InterfaceInfo[];

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

          {/* 하단: 프로젝트 인터페이스 관리 (좌측: 전체 인터페이스, 우측: 포함된 인터페이스) */}
          {currentProject.id && (
            <div style={{ flex: '1', display: 'flex', gap: '20px' }}>
              {/* 좌측 인터페이스 목록 */}
              <div
                style={{
                  width: '300px', // ← 왼쪽 패널 고정 폭
                  flexShrink: 0, // ← 남는 공간 줄어들지 않도록
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

              {/* 우측: 프로젝트에 포함된 인터페이스 */}
              <div
                style={{
                  flex: '1',
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
                  <strong>프로젝트에 포함된 인터페이스</strong>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {projectInterfaces.length === 0 ? (
                    <div
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#999',
                      }}
                    >
                      아직 추가된 인터페이스가 없습니다.
                    </div>
                  ) : (
                    projectInterfaces.map((inf, idx) => (
                      <ListItem key={inf.id} active={false}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <span>{inf.name}</span>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <Button
                              onClick={() => moveInterfaceUp(idx)}
                              style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                            >
                              ↑
                            </Button>
                            <Button
                              onClick={() => moveInterfaceDown(idx)}
                              style={{ padding: '2px 6px', fontSize: '0.8rem' }}
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
                          </div>
                        </div>
                      </ListItem>
                    ))
                  )}
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
