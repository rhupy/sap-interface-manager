import React, { useState } from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import {
  AppContainer,
  TabContainer,
  TabButton,
  ContentContainer,
  Title,
  Description,
  RightTabGroup,
} from './styles/CommonStyles';
import { MessageProvider } from './context/MessageContext';
import { MessageDisplay } from './components/MessageDisplay';
import InterfaceManagement from './pages/InterfaceManagement';
import RfcManagement from './pages/RfcManagement';
import SqlManagement from './pages/SqlManagement';
import SettingsComponent from './pages/SettingsComponent';
import { SettingsProvider } from './context/SettingContext';
import { FaQuestion, FaInfoCircle } from 'react-icons/fa';
import AboutComponent from './pages/AboutComponent';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'interface' | 'rfc' | 'sql' | 'process' | 'settings' | 'about'
  >('profile');

  return (
    <>
      <GlobalStyle />
      <SettingsProvider>
        <MessageProvider>
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
                active={activeTab === 'rfc'}
                onClick={() => setActiveTab('rfc')}
              >
                RFC 관리
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
              <RightTabGroup>
                <TabButton
                  active={activeTab === 'about'}
                  onClick={() => setActiveTab('about')}
                >
                  <FaQuestion style={{ marginRight: '5px' }} /> 도움말
                </TabButton>
              </RightTabGroup>
            </TabContainer>
            <ContentContainer>
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'interface' && <InterfaceManagement />}
              {activeTab === 'rfc' && <RfcManagement />}
              {activeTab === 'sql' && <SqlManagement />}
              {activeTab === 'process' && <ProcessManagement />}
              {activeTab === 'settings' && <SettingsComponent />}
              {activeTab === 'about' && <AboutComponent />}
            </ContentContainer>
            <MessageDisplay />
          </AppContainer>
        </MessageProvider>
      </SettingsProvider>
    </>
  );
}

function Profile() {
  return (
    <>
      <Title>프로파일</Title>
      <Description>프로파일 프로 파일...</Description>
    </>
  );
}

function ProcessManagement() {
  return (
    <>
      <Title>프로세스 관리</Title>
      <Description>프로세스 목록 및 설정...</Description>
    </>
  );
}
