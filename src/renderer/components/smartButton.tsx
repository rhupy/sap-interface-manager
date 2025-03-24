import React from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiSave,
  FiSearch,
  FiRefreshCw,
  FiCheck,
} from 'react-icons/fi';
import { Button as Btn } from '../styles/CommonStyles';

// 버튼 유형에 따른 배경색 정의
const getButtonColor = (text: string): string => {
  const lowerText = String(text).toLowerCase();

  if (lowerText.includes('삭제') || lowerText.includes('제거')) {
    return '#e74c3c'; // 빨간색 (삭제 버튼)
  }

  if (
    lowerText.includes('수정') ||
    lowerText.includes('편집') ||
    lowerText.includes('변경')
  ) {
    return '#95a5a6'; // 회색 (수정 버튼)
  }

  if (
    lowerText.includes('테스트') ||
    lowerText.includes('실행') ||
    lowerText.includes('시작')
  ) {
    return '#2ecc71'; // 녹색 (테스트/실행 버튼)
  }

  return '#4a90e2'; // 기본 파란색
};

// 버튼 텍스트에 따라 아이콘을 결정하는 함수
const getIconForText = (text: string): React.ReactNode => {
  const lowerText = String(text).toLowerCase();

  if (
    lowerText.includes('추가') ||
    lowerText.includes('생성') ||
    lowerText.includes('신규') ||
    lowerText.includes('등록')
  ) {
    return <FiPlus size={15} style={{ flexShrink: 0 }} />;
  }

  if (
    lowerText.includes('수정') ||
    lowerText.includes('편집') ||
    lowerText.includes('변경')
  ) {
    return <FiEdit2 size={15} style={{ flexShrink: 0 }} />;
  }

  if (lowerText.includes('삭제') || lowerText.includes('제거')) {
    return <FiTrash2 size={15} style={{ flexShrink: 0 }} />;
  }

  if (
    lowerText.includes('테스트') ||
    lowerText.includes('실행') ||
    lowerText.includes('시작')
  ) {
    return <FiPlay size={15} style={{ flexShrink: 0 }} />;
  }

  if (lowerText.includes('저장')) {
    return <FiSave size={15} style={{ flexShrink: 0 }} />;
  }

  if (
    lowerText.includes('검색') ||
    lowerText.includes('조회') ||
    lowerText.includes('찾기')
  ) {
    return <FiSearch size={15} style={{ flexShrink: 0 }} />;
  }

  if (
    lowerText.includes('새로고침') ||
    lowerText.includes('갱신') ||
    lowerText.includes('리로드')
  ) {
    return <FiRefreshCw size={15} style={{ flexShrink: 0 }} />;
  }

  if (lowerText.includes('확인') || lowerText.includes('완료')) {
    return <FiCheck size={15} style={{ flexShrink: 0 }} />;
  }

  return null;
};

// 버튼 유형에 따른 호버 색상 정의
const getHoverColor = (backgroundColor: string): string => {
  // 기본 색상보다 약간 어두운 색상 반환
  if (backgroundColor === '#e74c3c') return '#c0392b'; // 삭제 버튼 호버
  if (backgroundColor === '#95a5a6') return '#7f8c8d'; // 수정 버튼 호버
  if (backgroundColor === '#2ecc71') return '#27ae60'; // 테스트/실행 버튼 호버
  return '#357abd'; // 기본 버튼 호버
};

// 스마트 버튼 컴포넌트 타입 정의
interface SmartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

// 스마트 버튼 컴포넌트
const Button: React.FC<SmartButtonProps> = ({ children, style, ...props }) => {
  // 버튼 텍스트에 따라 아이콘과 색상 결정
  const buttonText = String(children || '');
  const icon = getIconForText(buttonText);
  const backgroundColor = getButtonColor(buttonText);
  const hoverColor = getHoverColor(backgroundColor);

  return (
    <Btn
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        backgroundColor,
        ...style,
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          hoverColor;
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          backgroundColor;
      }}
      {...props}
    >
      {icon}
      {children}
    </Btn>
  );
};

export default Button;
