// src/renderer/pages/AboutComponent.tsx
import React from 'react';
import styled from 'styled-components';
import { Title, Description } from '../styles/CommonStyles';

const AboutContainer = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const Link = styled.a`
  color: #4a90e2;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const List = styled.ul`
  margin-left: 20px;
  line-height: 1.6;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
`;

const VersionInfo = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  font-family: monospace;
`;

export default function AboutComponent() {
  return (
    <AboutContainer>
      <Title>SAP Interface Manager</Title>
      <Description>
        SAP & DB 의 데이터를 활용해 각종 로직을 생성 / 관리 / 자동화하는
        도구입니다.
      </Description>

      <Section>
        <SectionTitle>프로그램 소개</SectionTitle>
        SAP Interface Manager 는 비개발자를 포함한 누구나 쉽고 빠르게 데이터
        인터페이스를 구현하기 위해 만들었습니다.
        <br />
        별도의 개발 과정이나 소스 코드 수정, 빌드 과정 없이도 SAP와 Database간의
        로직을 손 쉽게 구현 / 테스트 / 적용 / 모니터링 / 유지보수 할 수
        있습니다.
        <br />
        이 앱은 React로 구현되었으며, Electron 프레임워크를 사용하여 데스크탑
        애플리케이션으로 제작되었습니다.
        <br />
        저의 취미로 제작된 오픈소스이며, 민간한 정보 (접속정보)를 제외하고
        소스코드는 모두 공개되어 있습니다.
      </Section>

      <Section>
        <SectionTitle>주요 기능 (개발 중인 사항 포함)</SectionTitle>
        <List>
          <ListItem>RFC 함수 호출 및 테스트</ListItem>
          <ListItem>데이터베이스 연결 및 SQL 쿼리 실행</ListItem>
          <ListItem>SAP-SAP / SAP-DB / DB-DB 간 파라미터 매핑과 연계</ListItem>
          <ListItem>자유로운 인터페이스 로직 구현</ListItem>
          <ListItem>인터페이스 프로세스 모니터링 및 관리 / 로깅</ListItem>
          <ListItem>다중 SAP 시스템 및 데이터베이스 연결 지원</ListItem>
          <ListItem>인터페이스의 자동화 스케줄링</ListItem>
          <ListItem>모든 세팅의 저장 / 백업 / 배포 가능</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>문의</SectionTitle>
        <p>
          문의사항이나 버그 리포트는 아래 Git 저장소에 이슈를 등록하거나 메일로
          연락바랍니다.
          <br />
          사용자 가이드는 GitHub 에서 README 를 참고해주세요.
        </p>
        <p>
          <Link
            href="https://github.com/rhupy/sap-interface-manager.git"
            target="_blank"
          >
            GitHub Repository
          </Link>
        </p>
        <p>
          <Link href="mailto:your.email@example.com">
            kimsungjiny@gmail.com
          </Link>
        </p>
      </Section>

      <VersionInfo>
        <div>버전: 0.0.3</div>
        <div>빌드 날짜: 2024-02-27</div>
        <div>© 2024 김성진. All rights reserved.</div>
      </VersionInfo>
    </AboutContainer>
  );
}
