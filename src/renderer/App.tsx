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
import SettingsComponent from './pages/SettingsComponent';
import { SettingsProvider } from './context/SettingContext';
import { Settings } from './types/index';

export default function App() {
  const [settings, setSettings] = useState<Settings>({
    rfcList: [],
    dbConnections: [],
    selectedRfc: '',
    selectedDbId: '',
  });

  const [activeTab, setActiveTab] = useState<
    'profile' | 'interface' | 'sql' | 'process' | 'settings'
  >('profile');

  return (
    <>
      <GlobalStyle />
      <SettingsProvider settings={settings}>
        <AppContainer>
          <TabContainer>
            <TabButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            >
              프로파일
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
              active={activeTab === 'process'}
              onClick={() => setActiveTab('process')}
            >
              프로세스 관리
            </TabButton>
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            >
              환경 설정
            </TabButton>
          </TabContainer>
          <ContentContainer>
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'interface' && <InterfaceManagement />}
            {activeTab === 'sql' && <SqlManagement />}
            {activeTab === 'process' && <ProcessManagement />}
            {activeTab === 'settings' && <SettingsComponent />}
          </ContentContainer>
        </AppContainer>
      </SettingsProvider>
    </>
  );
}

function Profile() {
  return (
    <>
      <Title>프로파일</Title>
      <Description>인터페이스 프로 파일...</Description>
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

function ProcessManagement() {
  return (
    <>
      <Title>프로세스 관리</Title>
      <Description>인터페이스 목록 및 설정...</Description>
    </>
  );
}
