import React, { useState } from 'react';
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
  const lowerText = text.toLowerCase();

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

const getIconForText = (text: string): React.ReactNode => {
  const lowerText = text.toLowerCase();

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

const getHoverColor = (baseColor: string): string => {
  if (baseColor === '#e74c3c') return '#c0392b'; // 삭제 버튼 호버
  if (baseColor === '#95a5a6') return '#7f8c8d'; // 수정 버튼 호버
  if (baseColor === '#2ecc71') return '#27ae60'; // 실행 버튼 호버
  return '#357abd'; // 기본 버튼 호버
};

// 스마트 버튼 컴포넌트
interface SmartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const Button: React.FC<SmartButtonProps> = ({ children, style, ...props }) => {
  const buttonText = String(children || '');
  const icon = getIconForText(buttonText);
  const baseColor = getButtonColor(buttonText);
  const hoverColor = getHoverColor(baseColor);

  // isHovered 상태로 호버 시/비호버 시 배경색 조절
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Btn
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        backgroundColor: isHovered ? hoverColor : baseColor,
        transition: 'background-color 0.2s ease',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {icon}
      {children}
    </Btn>
  );
};

export default Button;
