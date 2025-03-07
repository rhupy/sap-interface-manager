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
import { InterfaceExecutorProvider } from './context/InterfaceExecutorContext';
import { FaQuestion, FaInfoCircle } from 'react-icons/fa';
import AboutComponent from './pages/AboutComponent';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'project' | 'interface' | 'rfc' | 'sql' | 'process' | 'settings' | 'about'
  >('project');

  return (
    <>
      <GlobalStyle />
      <SettingsProvider>
        <MessageProvider>
          <InterfaceExecutorProvider>
            <AppContainer>
              <TabContainer>
                <TabButton
                  active={activeTab === 'project'}
                  onClick={() => setActiveTab('project')}
                >
                  프로젝트
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
                {/* <TabButton
                active={activeTab === 'process'}
                onClick={() => setActiveTab('process')}
              >
                프로세스 관리
              </TabButton> */}
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
                {activeTab === 'project' && <Profile />}
                {activeTab === 'interface' && <InterfaceManagement />}
                {activeTab === 'rfc' && <RfcManagement />}
                {activeTab === 'sql' && <SqlManagement />}
                {activeTab === 'process' && <ProcessManagement />}
                {activeTab === 'settings' && <SettingsComponent />}
                {activeTab === 'about' && <AboutComponent />}
              </ContentContainer>
              <MessageDisplay />
            </AppContainer>
          </InterfaceExecutorProvider>
        </MessageProvider>
      </SettingsProvider>
    </>
  );
}

function Profile() {
  return (
    <>
      <Title>프로젝트</Title>
      <Description>프로젝트 프로 파일...</Description>
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
