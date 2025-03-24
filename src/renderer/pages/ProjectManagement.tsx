// src/renderer/pages/ProjectManagement.tsx

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
  Label,
  LeftAlignedLabel,
  Select,
  SmallSelect,
  MetaInfo,
  ButtonGroup,
} from '../styles/CommonStyles';
import Button from '../components/smartButton';
import { useSettingsContext } from '../context/SettingContext';
import { useMessage } from '../context/MessageContext';
import { ProjectInfo, InterfaceInfo } from '../types'; // ProjectInfo는 새로 정의 필요
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해(필요시)

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

  // 현재 편집중인 프로젝트 정보
  const [currentProject, setCurrentProject] =
    useState<ProjectInfo>(emptyProject);
  // 삭제 확인 모달 표시 여부
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --------------------------------------------
  // 프로젝트 목록 가져오기 (Settings에서 projects)
  // --------------------------------------------
  const projects = settings.projects || [];

  // --------------------------------------------
  // 프로젝트 선택 시 state 업데이트
  // --------------------------------------------
  const handleSelectProject = (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      // 이미 선택된 프로젝트를 Settings에서도 갱신하고 싶다면:
      updateSettings({ selectedProjectId: found.id });
    }
  };

  // --------------------------------------------
  // 프로젝트 목록 정렬 및 검색 적용
  // --------------------------------------------
  const getSortedAndFilteredProjects = React.useMemo(() => {
    const filtered = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

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

  // --------------------------------------------
  // 프로젝트 추가
  // --------------------------------------------
  const handleAddProject = () => {
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }
    const now = new Date().toISOString();
    const newId = uuidv4(); // 혹은 Date.now() 등 원하는 ID 생성 로직
    const newProject: ProjectInfo = {
      ...currentProject,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    // 이미 존재하는 이름 검사 (필요하다면)
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

  // --------------------------------------------
  // 프로젝트 수정
  // --------------------------------------------
  const handleUpdateProject = () => {
    if (!currentProject.id) {
      showMessage('수정할 프로젝트가 선택되지 않았습니다.');
      return;
    }
    if (!currentProject.name.trim()) {
      showMessage('프로젝트 이름을 입력하세요.', 'error');
      return;
    }

    const now = new Date().toISOString();

    // 중복 이름 검사 (본인 제외)
    const isDuplicate = projects.some(
      (p) => p.name === currentProject.name && p.id !== currentProject.id
    );
    if (isDuplicate) {
      showMessage('이미 같은 이름의 프로젝트가 있습니다.', 'error');
      return;
    }

    const updatedProject: ProjectInfo = {
      ...currentProject,
      updatedAt: now,
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));

    setCurrentProject(updatedProject);
    showMessage('프로젝트가 수정되었습니다.', 'success');
  };

  // --------------------------------------------
  // 프로젝트 삭제 확인 모달 열기
  // --------------------------------------------
  const handleDeleteProjectClick = () => {
    if (!currentProject.id) {
      showMessage('삭제할 프로젝트가 선택되지 않았습니다.', 'error');
      return;
    }
    setShowDeleteConfirm(true);
  };

  // --------------------------------------------
  // 프로젝트 삭제 수행
  // --------------------------------------------
  const handleDeleteProject = () => {
    if (!currentProject.id) return;

    const updatedList = projects.filter((p) => p.id !== currentProject.id);
    updateSettings({
      projects: updatedList,
      selectedProjectId: updatedList.length > 0 ? updatedList[0].id : '',
    });

    setShowDeleteConfirm(false);
    showMessage('프로젝트가 삭제되었습니다.', 'success');
    setCurrentProject(
      updatedList.length > 0 ? updatedList[0] : { ...emptyProject }
    );
  };

  // --------------------------------------------
  // 프로젝트 내에 인터페이스 추가
  // --------------------------------------------
  const handleAddInterfaceToProject = (interfaceId: string) => {
    if (!currentProject.id) {
      showMessage('프로젝트를 먼저 선택하거나 생성하세요.', 'error');
      return;
    }
    if (currentProject.interfaceIds.includes(interfaceId)) {
      showMessage('이미 추가된 인터페이스입니다.', 'error');
      return;
    }

    const updatedInterfaceIds = [...currentProject.interfaceIds, interfaceId];
    const updatedProject = {
      ...currentProject,
      interfaceIds: updatedInterfaceIds,
      updatedAt: new Date().toISOString(),
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
    setCurrentProject(updatedProject);

    showMessage('인터페이스가 프로젝트에 추가되었습니다.', 'success');
  };

  // --------------------------------------------
  // 프로젝트 내 인터페이스 삭제
  // --------------------------------------------
  const handleRemoveInterfaceFromProject = (interfaceId: string) => {
    if (!currentProject.id) return;
    const updatedInterfaceIds = currentProject.interfaceIds.filter(
      (id) => id !== interfaceId
    );
    const updatedProject = {
      ...currentProject,
      interfaceIds: updatedInterfaceIds,
      updatedAt: new Date().toISOString(),
    };

    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
    setCurrentProject(updatedProject);

    showMessage('인터페이스가 프로젝트에서 제거되었습니다.', 'success');
  };

  // --------------------------------------------
  // 순서 변경(위로)
  // --------------------------------------------
  const moveInterfaceUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...currentProject.interfaceIds];
    const temp = arr[index - 1];
    arr[index - 1] = arr[index];
    arr[index] = temp;

    const updatedProject = {
      ...currentProject,
      interfaceIds: arr,
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
    setCurrentProject(updatedProject);
  };

  // --------------------------------------------
  // 순서 변경(아래로)
  // --------------------------------------------
  const moveInterfaceDown = (index: number) => {
    if (index >= currentProject.interfaceIds.length - 1) return;
    const arr = [...currentProject.interfaceIds];
    const temp = arr[index + 1];
    arr[index + 1] = arr[index];
    arr[index] = temp;

    const updatedProject = {
      ...currentProject,
      interfaceIds: arr,
      updatedAt: new Date().toISOString(),
    };
    updateSettings((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
    setCurrentProject(updatedProject);
  };

  // --------------------------------------------
  // 날짜 포맷
  // --------------------------------------------
  const formatDateTime = (isoString: string) => {
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
  };

  if (isLoading) {
    return <div>프로젝트 정보를 불러오는 중...</div>;
  }

  // 프로젝트에 속한 인터페이스 목록
  const projectInterfaces: InterfaceInfo[] = (settings.interfaces || []).filter(
    (inf) => currentProject.interfaceIds.includes(inf.id)
  );

  // 추가 가능한 인터페이스(프로젝트에 없는 것만)
  const availableInterfaces: InterfaceInfo[] = (
    settings.interfaces || []
  ).filter((inf) => !currentProject.interfaceIds.includes(inf.id));

  return (
    <FullPageContainer>
      <FlexContainer>
        {/* 왼쪽: 프로젝트 목록 */}
        <SidePanel>
          <SidePanelHeader>
            <h3>프로젝트 목록</h3>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
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
                <option value="createdAt">생성</option>
                <option value="updatedAt">수정</option>
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
            {getSortedAndFilteredProjects.length === 0 ? (
              <div
                style={{ padding: '10px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 프로젝트가 없습니다.'}
              </div>
            ) : (
              getSortedAndFilteredProjects.map((project) => (
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

        {/* 오른쪽: 프로젝트 상세 */}
        <MainPanel>
          <Section>
            <SectionTitle>프로젝트 정보</SectionTitle>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>프로젝트 이름</LeftAlignedLabel>
                <Input
                  value={currentProject.name}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      name: e.target.value,
                    })
                  }
                  placeholder="예) 2023년 고객데이터 동기화"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <LeftAlignedLabel>설명</LeftAlignedLabel>
                <Input
                  value={currentProject.description}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="프로젝트에 대한 간단한 설명"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  <div>생성: {formatDateTime(currentProject.createdAt)}</div>
                  <div>수정: {formatDateTime(currentProject.updatedAt)}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
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
                  <option value="">RFC 연결 선택</option>
                  {(settings.rfcConnections || []).map((rfc) => (
                    <option key={rfc.connectionName} value={rfc.connectionName}>
                      {rfc.connectionName}
                    </option>
                  ))}
                </Select>
              </div>
              <div style={{ flex: 1 }}>
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
                  <option value="">DB 연결 선택</option>
                  {(settings.dbConnections || []).map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.connectionName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <ButtonGroup>
              {!currentProject.id ? (
                <Button onClick={handleAddProject}>새 프로젝트 추가</Button>
              ) : (
                <>
                  <Button onClick={handleUpdateProject}>프로젝트 수정</Button>
                  <Button
                    style={{ backgroundColor: '#e74c3c' }}
                    onClick={handleDeleteProjectClick}
                  >
                    프로젝트 삭제
                  </Button>
                </>
              )}
            </ButtonGroup>
          </Section>

          {currentProject.id && (
            <Section style={{ marginTop: '10px' }}>
              <SectionTitle>프로젝트에 인터페이스 추가</SectionTitle>
              <div
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <Select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddInterfaceToProject(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{ width: '300px' }}
                  value=""
                >
                  <option value="">인터페이스 선택</option>
                  {availableInterfaces.map((inf) => (
                    <option key={inf.id} value={inf.id}>
                      {inf.name}
                    </option>
                  ))}
                </Select>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  추가할 인터페이스를 선택하세요
                </span>
              </div>

              <div
                style={{
                  marginTop: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              >
                <SectionTitle>프로젝트에 포함된 인터페이스</SectionTitle>
                {projectInterfaces.length === 0 ? (
                  <div style={{ padding: '10px', color: '#666' }}>
                    아직 추가된 인터페이스가 없습니다.
                  </div>
                ) : (
                  projectInterfaces.map((inf, index) => (
                    <div
                      key={inf.id}
                      style={{
                        padding: '8px',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{inf.name}</strong>
                        {inf.description ? (
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {inf.description}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          onClick={() => moveInterfaceUp(index)}
                          style={{ padding: '2px 6px', fontSize: '0.85rem' }}
                        >
                          ↑
                        </Button>
                        <Button
                          onClick={() => moveInterfaceDown(index)}
                          style={{ padding: '2px 6px', fontSize: '0.85rem' }}
                        >
                          ↓
                        </Button>
                        <Button
                          onClick={() =>
                            handleRemoveInterfaceFromProject(inf.id)
                          }
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.85rem',
                            backgroundColor: '#e74c3c',
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Section>
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
