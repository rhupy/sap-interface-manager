import React, { useState } from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import {
  AppContainer,
  TabContainer,
  TabButton,
  ContentContainer,
  Title,
  Description,
} from './styles/CommonStyles';
// 다른 페이지(컴포넌트) import
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'interface' | 'sql' | 'settings'
  >('dashboard');

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TabContainer>
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          >
            대시 보드
          </TabButton>
          <TabButton
            active={activeTab === 'interface'}
            onClick={() => setActiveTab('interface')}
          >
            인터페이스 관리
          </TabButton>
          <TabButton
            active={activeTab === 'sql'}
            onClick={() => setActiveTab('sql')}
          >
            SQL 관리
          </TabButton>
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            환경 설정
          </TabButton>
        </TabContainer>
        <ContentContainer>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'interface' && <InterfaceManagement />}
          {activeTab === 'sql' && <SqlManagement />}
          {activeTab === 'settings' && <Settings />}
        </ContentContainer>
      </AppContainer>
    </>
  );
}

function Dashboard() {
  return (
    <>
      <Title>대시보드</Title>
      <Description>인터페이스 목록 및 설정...</Description>
    </>
  );
}

function InterfaceManagement() {
  return (
    <>
      <Title>인터페이스 관리</Title>
      <Description>인터페이스 목록 및 설정...</Description>
    </>
  );
}

function SqlManagement() {
  return (
    <>
      <Title>SQL 관리</Title>
      <Description>인터페이스 목록 및 설정...</Description>
    </>
  );
}
