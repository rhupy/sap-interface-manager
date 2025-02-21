import { createGlobalStyle } from 'styled-components';

// 타입 명시적으로 추가
export const GlobalStyle: ReturnType<typeof createGlobalStyle> =
  createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
  }
`;
