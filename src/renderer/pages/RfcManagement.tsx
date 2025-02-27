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
} from '../styles/CommonStyles';

import { useSettingsContext } from '../context/SettingContext';
import { RfcConnectionInfo } from '../types';

// RFC 정보 기본값
const emptyRfc: RfcConnectionInfo & {
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} = {
  connectionName: '',
  appServerHost: '',
  systemNumber: '',
  systemID: '',
  user: '',
  password: '',
  client: '',
  language: '',
  poolSize: '',
  description: '', // 추가 필드
  createdAt: '', // 추가 필드
  updatedAt: '', // 추가 필드
};

// 정렬 타입 정의
type SortType = 'name' | 'createdAt' | 'updatedAt';

export default function RfcManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { settings, updateSettings, isLoading } = useSettingsContext();
  const [message, setMessage] = useState('');
  const [newRfc, setNewRfc] = useState<typeof emptyRfc>(emptyRfc);

  // 정렬 상태 추가
  const [sortType, setSortType] = useState<SortType>('name');

  // RFC 목록 확장 (시간 정보 추가)
  const [extendedRfcList, setExtendedRfcList] = useState<
    (RfcConnectionInfo & {
      description?: string;
      createdAt?: string;
      updatedAt?: string;
    })[]
  >([]);

  // 확장된 RFC 목록 초기화
  useEffect(() => {
    // 기존 RFC 목록에 시간 정보 추가
    if (settings.rfcList) {
      const extended = settings.rfcList.map((rfc) => {
        // 이미 확장된 정보가 있으면 유지, 없으면 현재 시간 추가
        const existing = extendedRfcList.find(
          (e) => e.connectionName === rfc.connectionName
        );
        return {
          ...rfc,
          description: existing?.description || '',
          createdAt: existing?.createdAt || getCurrentFormattedTime(),
          updatedAt: existing?.updatedAt || getCurrentFormattedTime(),
        };
      });
      setExtendedRfcList(extended);
    }
  }, [settings.rfcList]);

  // 정렬 및 검색 적용된 RFC 목록
  const filteredAndSortedRfcList = React.useMemo(() => {
    // 검색어로 필터링
    const filtered = extendedRfcList.filter(
      (item) =>
        item.connectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 정렬 적용
    return [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'name':
          return a.connectionName.localeCompare(b.connectionName);
        case 'createdAt':
          return (
            new Date(b.createdAt || '').getTime() -
            new Date(a.createdAt || '').getTime()
          );
        case 'updatedAt':
          return (
            new Date(b.updatedAt || '').getTime() -
            new Date(a.updatedAt || '').getTime()
          );
        default:
          return 0;
      }
    });
  }, [extendedRfcList, searchTerm, sortType]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 선택된 RFC가 변경될 때 newRfc 업데이트
  useEffect(() => {
    if (!settings.selectedRfc) {
      setNewRfc(emptyRfc);
      return;
    }

    const found = extendedRfcList.find(
      (rfc) => rfc.connectionName === settings.selectedRfc
    );

    if (found) {
      setNewRfc(found);
    } else {
      setNewRfc(emptyRfc);
    }
  }, [settings.selectedRfc, extendedRfcList]);

  // 현재 시간 포맷팅 함수
  function getCurrentFormattedTime() {
    const now = new Date();
    return now.toISOString();
  }

  // 시간 표시 포맷팅 함수
  function formatDateTime(isoString?: string) {
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

  // RFC 선택 핸들러
  const handleSelectRfc = (connectionName: string) => {
    updateSettings({ selectedRfc: connectionName });
  };

  // RFC 추가 핸들러
  const handleAddRfc = () => {
    if (!newRfc.connectionName || !newRfc.appServerHost) {
      setMessage('연결 이름과 서버 호스트를 입력하세요.');
      return;
    }

    const isDuplicate = settings.rfcList.some(
      (rfc) => rfc.connectionName === newRfc.connectionName
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 연결 이름입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();

    // 확장 필드 분리
    const { description, createdAt, updatedAt, ...rfcData } = newRfc;

    // RFC 목록에 추가
    updateSettings((prev) => ({
      ...prev,
      rfcList: [...prev.rfcList, rfcData],
      selectedRfc: newRfc.connectionName,
    }));

    // 확장 정보 업데이트
    setExtendedRfcList((prev) => [
      ...prev,
      {
        ...newRfc,
        createdAt: currentTime,
        updatedAt: currentTime,
      },
    ]);

    setMessage('RFC 연결이 추가되었습니다.');
  };

  // RFC 수정 핸들러
  const handleUpdateRfc = () => {
    if (!settings.selectedRfc) {
      setMessage('수정할 RFC가 선택되지 않았습니다.');
      return;
    }

    if (!newRfc.connectionName || !newRfc.appServerHost) {
      setMessage('연결 이름과 서버 호스트를 입력하세요.');
      return;
    }

    // 다른 RFC와 중복 이름 검사
    const isDuplicate = settings.rfcList.some(
      (rfc) =>
        rfc.connectionName === newRfc.connectionName &&
        rfc.connectionName !== settings.selectedRfc
    );

    if (isDuplicate) {
      setMessage('이미 존재하는 연결 이름입니다.');
      return;
    }

    const currentTime = getCurrentFormattedTime();

    // 확장 필드 분리
    const { description, createdAt, updatedAt, ...rfcData } = newRfc;

    // RFC 목록 업데이트
    updateSettings((prev) => ({
      ...prev,
      rfcList: prev.rfcList.map((rfc) =>
        rfc.connectionName === settings.selectedRfc ? rfcData : rfc
      ),
      // 이름이 변경된 경우 selectedRfc도 업데이트
      selectedRfc: newRfc.connectionName,
    }));

    // 확장 정보 업데이트
    setExtendedRfcList((prev) =>
      prev.map((rfc) =>
        rfc.connectionName === settings.selectedRfc
          ? { ...newRfc, updatedAt: currentTime }
          : rfc
      )
    );

    setMessage('RFC 연결이 수정되었습니다.');
  };

  // RFC 삭제 핸들러
  const handleDeleteRfc = () => {
    if (!settings.selectedRfc) {
      setMessage('삭제할 RFC가 선택되지 않았습니다.');
      return;
    }

    // RFC 목록에서 삭제
    updateSettings((prev) => ({
      ...prev,
      rfcList: prev.rfcList.filter(
        (rfc) => rfc.connectionName !== settings.selectedRfc
      ),
      selectedRfc: '',
    }));

    // 확장 정보에서도 삭제
    setExtendedRfcList((prev) =>
      prev.filter((rfc) => rfc.connectionName !== settings.selectedRfc)
    );

    setMessage('RFC 연결이 삭제되었습니다.');
  };

  // RFC 테스트 핸들러
  const testRfcConnection = async () => {
    if (!window.api?.testRfcConnection) {
      setMessage('RFC 테스트 기능이 지원되지 않습니다.');
      return;
    }

    if (!settings.selectedRfc) {
      setMessage('테스트할 RFC를 선택하세요.');
      return;
    }

    const rfc = settings.rfcList.find(
      (r) => r.connectionName === settings.selectedRfc
    );

    if (!rfc) {
      setMessage('선택된 RFC 연결 정보를 찾지 못했습니다.');
      return;
    }

    try {
      const result = await window.api.testRfcConnection({
        appServerHost: rfc.appServerHost,
        systemNumber: rfc.systemNumber,
        systemID: rfc.systemID,
        user: rfc.user,
        password: rfc.password,
        client: rfc.client,
        language: rfc.language,
        poolSize: rfc.poolSize,
      });

      if (result.success) {
        setMessage(`RFC "${rfc.connectionName}" 연결 테스트 성공`);
      } else {
        setMessage(
          `RFC "${rfc.connectionName}" 연결 테스트 실패: ${result.message || ''}`
        );
      }
    } catch (error: any) {
      setMessage(
        `RFC "${rfc.connectionName}" 연결 테스트 에러: ${error?.message || error}`
      );
    }
  };

  // 정렬 타입 변경 핸들러
  const handleSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value as SortType);
  };

  if (isLoading) {
    return <div>RFC 설정을 불러오는 중...</div>;
  }

  return (
    <FullPageContainer>
      <Title>RFC 관리</Title>
      <Description>등록된 RFC 목록 및 수정/추가/삭제 기능</Description>

      <FlexContainer>
        {/* 왼쪽 RFC 목록 패널 */}
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
            {filteredAndSortedRfcList.length === 0 ? (
              <div
                style={{ padding: '15px', textAlign: 'center', color: '#999' }}
              >
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : '등록된 RFC가 없습니다.'}
              </div>
            ) : (
              filteredAndSortedRfcList.map((item) => (
                <ListItem
                  key={item.connectionName}
                  active={item.connectionName === settings.selectedRfc}
                  onClick={() => handleSelectRfc(item.connectionName)}
                >
                  <strong>{item.connectionName}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#777' }}>
                    {item.appServerHost} - {item.systemID || item.systemNumber}
                    {item.description && (
                      <div>
                        {item.description.slice(0, 30)}
                        {item.description.length > 30 ? '...' : ''}
                      </div>
                    )}
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

        {/* 오른쪽 RFC 정보 패널 */}
        <MainPanel>
          <Section>
            <SectionTitle>RFC 정보</SectionTitle>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>연결 이름</LeftAlignedLabel>
                <Input
                  value={newRfc.connectionName}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, connectionName: e.target.value })
                  }
                  placeholder="예) SAP_PROD"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LeftAlignedLabel>설명</LeftAlignedLabel>
                <Input
                  value={newRfc.description || ''}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, description: e.target.value })
                  }
                  placeholder="RFC에 대한 간단한 설명"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            </div>

            {/* 생성/수정 시간 표시 */}
            {newRfc.createdAt && (
              <div
                style={{
                  marginBottom: '5px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                <div>생성: {formatDateTime(newRfc.createdAt)}</div>
                {newRfc.updatedAt && newRfc.updatedAt !== newRfc.createdAt && (
                  <div>수정: {formatDateTime(newRfc.updatedAt)}</div>
                )}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <div>
                <LeftAlignedLabel>서버 호스트</LeftAlignedLabel>
                <Input
                  value={newRfc.appServerHost}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, appServerHost: e.target.value })
                  }
                  placeholder="호스트 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>시스템 번호</LeftAlignedLabel>
                <Input
                  value={newRfc.systemNumber}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, systemNumber: e.target.value })
                  }
                  placeholder="시스템 번호 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>시스템 ID</LeftAlignedLabel>
                <Input
                  value={newRfc.systemID}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, systemID: e.target.value })
                  }
                  placeholder="시스템 ID 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>클라이언트</LeftAlignedLabel>
                <Input
                  value={newRfc.client}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, client: e.target.value })
                  }
                  placeholder="클라이언트 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>사용자</LeftAlignedLabel>
                <Input
                  value={newRfc.user}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, user: e.target.value })
                  }
                  placeholder="사용자 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>비밀번호</LeftAlignedLabel>
                <Input
                  type="password"
                  value={newRfc.password}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, password: e.target.value })
                  }
                  placeholder="비밀번호 입력"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>언어</LeftAlignedLabel>
                <Input
                  value={newRfc.language}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, language: e.target.value })
                  }
                  placeholder="언어 입력 (예: KO)"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
              <div>
                <LeftAlignedLabel>풀 크기</LeftAlignedLabel>
                <Input
                  value={newRfc.poolSize}
                  onChange={(e) =>
                    setNewRfc({ ...newRfc, poolSize: e.target.value })
                  }
                  placeholder="풀 크기 입력 (예: 10)"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
              </div>
            </div>

            <ButtonGroup>
              {/* 선택된 RFC가 없으면 '추가' 버튼만 */}
              {!settings.selectedRfc ? (
                <Button onClick={handleAddRfc}>새 RFC 추가</Button>
              ) : (
                <>
                  <Button onClick={handleAddRfc}>새 RFC 추가</Button>
                  <Button onClick={testRfcConnection}>연결 테스트</Button>
                  <Button onClick={handleUpdateRfc}>수정</Button>
                  <DeleteButton onClick={handleDeleteRfc}>삭제</DeleteButton>
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
              : '#E41E1E'
          }
        >
          {message}
        </FixedMessage>
      )}
    </FullPageContainer>
  );
}
