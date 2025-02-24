// src/renderer/styles/CommonStyles.ts
import styled from 'styled-components';

export const AppContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

export const TabButton = styled.button<{ active: boolean }>`
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

export const ContentContainer = styled.div`
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h2`
  color: #333333;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 600;
`;

export const Description = styled.p`
  color: #666666;
  font-size: 16px;
  line-height: 1.5;
`;

// 그 외, 아래처럼 이미 있던 것들은 유지
export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
`;

export const Divider = styled.hr`
  margin: 1rem 0;
  border: none; /* 필요하다면 */
  border-top: 1px solid #ccc; /* 다른 스타일 */
`;

/** 공통 섹션 블록 */
export const Section = styled.div`
  margin-bottom: 2rem;
`;

/** 섹션 제목 */
export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
`;

/** 라벨 */
export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

/** 인풋 */
export const Input = styled.input`
  display: block;
  width: 300px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

/** 셀렉트 */
export const Select = styled.select`
  display: block;
  width: 310px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

/** 버튼 */
export const Button = styled.button`
  margin-right: 1rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #4a90e2;
  color: #fff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #357abd;
  }
`;

/** 메시지 */
export const Message = styled.p<{ color?: string }>`
  margin-top: 0.5rem;
  color: ${(props) => props.color || '#333'};
  font-weight: 500;
`;
