import React, { useState } from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import {
  AppContainer,
  TabContainer,
  TabButton,
  ContentContainer,
  RightTabGroup,
} from './styles/CommonStyles';
import { MessageProvider } from './context/MessageContext';
import { MessageDisplay } from './components/MessageDisplay';
import InterfaceManagement from './pages/InterfaceManagement';
import RfcManagement from './pages/RfcManagement';
import SqlManagement from './pages/SqlManagement';
import SettingsManagement from './pages/SettingsManagement';
import { SettingsProvider } from './context/SettingContext';
import { InterfaceExecutorProvider } from './context/InterfaceExecutorContext';
import { FaQuestion } from 'react-icons/fa';
import AboutHelp from './pages/AboutHelp';
import ProjectManagement from './pages/ProjectManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'project' | 'interface' | 'rfc' | 'sql' | 'settings' | 'about'
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

              <ContentContainer
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  overflow: 'hidden', // 세로 스크롤을 없애기 위한 설정
                }}
              >
                {/* 탭에 따라 컴포넌트를 숨기고 보이도록 설정 */}
                <div
                  style={{
                    display: activeTab === 'project' ? 'block' : 'none',
                    flex: 1, // 세로 크기를 100%로 맞춤
                    overflow: 'auto', // 세로 스크롤 발생시 스크롤 가능하게 설정
                  }}
                >
                  <ProjectManagement />
                </div>
                <div
                  style={{
                    display: activeTab === 'interface' ? 'block' : 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <InterfaceManagement />
                </div>
                <div
                  style={{
                    display: activeTab === 'rfc' ? 'block' : 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <RfcManagement />
                </div>
                <div
                  style={{
                    display: activeTab === 'sql' ? 'block' : 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <SqlManagement />
                </div>
                <div
                  style={{
                    display: activeTab === 'settings' ? 'block' : 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <SettingsManagement />
                </div>
                <div
                  style={{
                    display: activeTab === 'about' ? 'block' : 'none',
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  <AboutHelp />
                </div>
              </ContentContainer>
              <MessageDisplay />
            </AppContainer>
          </InterfaceExecutorProvider>
        </MessageProvider>
      </SettingsProvider>
    </>
  );
}
