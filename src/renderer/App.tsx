import React, { useState } from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import styled from 'styled-components';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: ${(props) => (props.active ? '#4A90E2' : '#F5F6FA')};
  color: ${(props) => (props.active ? '#FFFFFF' : '#333333')};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => (props.active ? '#357ABD' : '#E9ECEF')};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentContainer = styled.div`
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #333333;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 600;
`;

const Description = styled.p`
  color: #666666;
  font-size: 16px;
  line-height: 1.5;
`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'interface' | 'settings'>(
    'interface'
  );

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TabContainer>
          <TabButton
            active={activeTab === 'interface'}
            onClick={() => setActiveTab('interface')}
          >
            인터페이스 관리
          </TabButton>
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            환경 설정
          </TabButton>
        </TabContainer>
        <ContentContainer>
          {activeTab === 'interface' && <InterfaceManagement />}
          {activeTab === 'settings' && <Settings />}
        </ContentContainer>
      </AppContainer>
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

function Settings() {
  return (
    <>
      <Title>환경 설정</Title>
      <Description>앱 환경 설정...</Description>
    </>
  );
}
