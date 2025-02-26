// src/renderer/styles/CommonStyles.ts
import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

export const TabContainer = styled.div`
  display: flex;
  background-color: #e0e0e0;
  padding: 10px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  margin-right: 5px;
  border: none;
  background-color: ${({ active }) => (active ? '#4A90E2' : '#f0f0f0')};
  color: ${({ active }) => (active ? '#fff' : '#000')};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: ${({ active }) => (active ? '#357ABD' : '#e0e0e0')};
  }
`;

export const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

export const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #666;
`;

export const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  background-color: #4a90e2;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #357abd;
  }
`;

export const Input = styled.input`
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px; // 고정된 너비
  max-width: 250px; // 최대 너비 제한
`;

export const Select = styled.select`
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px; // 고정된 너비
  max-width: 250px; // 최대 너비 제한
`;

export const Label = styled.label`
  margin-right: 15px;
  font-weight: bold;
  width: 120px; // 고정된 라벨 너비
  min-width: 120px; // 최소 너비 유지
  display: inline-block; // 수평 정렬 유지
  text-align: right; // 라벨 텍스트 오른쪽 정렬
`;

export const Message = styled.div<{ color: string }>`
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  color: ${({ color }) => color};
`;

export const Section = styled.div`
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px; // 섹션 최대 너비 제한
  width: 100%; // 부모 크기에 맞춤
  margin-left: auto;
  margin-right: auto; // 중앙 정렬
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

export const FixedMessage = styled.div<{ color?: string }>`
  position: fixed; /* 화면에 고정 */
  bottom: 0; /* 화면 하단 */
  left: 0; /* 화면 왼쪽 기준 */
  width: 100%; /* 가로폭 전체 */
  text-align: center; /* 텍스트 중앙 정렬 */
  background-color: #f0f0f0;
  padding: 10px;
  border-top: 1px solid #ccc;
  z-index: 9999; /* 다른 요소 위에 표시 */

  color: ${({ color }) => color || '#333'};
`;
