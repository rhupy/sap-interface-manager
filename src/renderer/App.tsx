import React from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
`;

export const App = () => {
  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Welcome to SAP Interface Manager</Title>
      </Container>
    </>
  );
};
