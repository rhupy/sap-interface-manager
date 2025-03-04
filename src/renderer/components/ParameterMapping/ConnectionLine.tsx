import React, { useEffect, useRef } from 'react';
import { MappingConnection } from './types';

interface ConnectionLineProps {
  connection: MappingConnection;
  onDelete?: (connectionId: string) => void;
  readOnly?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  onDelete,
  readOnly = false,
}) => {
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    updateLine();

    // 윈도우 리사이즈 시 선 업데이트
    window.addEventListener('resize', updateLine);
    return () => {
      window.removeEventListener('resize', updateLine);
    };
  }, [connection]);

  const updateLine = () => {
    const sourceEl = document.getElementById(
      `mapping-item-${connection.sourceId}`
    );
    const targetEl = document.getElementById(
      `mapping-item-${connection.targetId}`
    );

    if (!sourceEl || !targetEl || !lineRef.current) return;

    const sourcePoint = sourceEl.querySelector('.connection-point');
    const targetPoint = targetEl.querySelector('.connection-point');

    if (!sourcePoint || !targetPoint) return;

    const sourceRect = sourcePoint.getBoundingClientRect();
    const targetRect = targetPoint.getBoundingClientRect();
    const svgRect = lineRef.current.ownerSVGElement?.getBoundingClientRect();

    if (!svgRect) return;

    // 시작점과 끝점 계산
    const x1 = sourceRect.left + sourceRect.width / 2 - svgRect.left;
    const y1 = sourceRect.top + sourceRect.height / 2 - svgRect.top;
    const x2 = targetRect.left + targetRect.width / 2 - svgRect.left;
    const y2 = targetRect.top + targetRect.height / 2 - svgRect.top;

    // 베지어 곡선으로 선 그리기
    const dx = Math.abs(x2 - x1) * 0.5;
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    lineRef.current.setAttribute('d', path);
  };

  const handleLineClick = () => {
    if (!readOnly && onDelete) {
      onDelete(connection.id);
    }
  };

  return (
    <>
      {/* 실제 선 (시각적 표현) */}
      <path
        ref={lineRef}
        stroke="#4a90e2"
        strokeWidth="2"
        fill="none"
        style={{ pointerEvents: 'none' }} // 이 선은 클릭 이벤트를 받지 않음
      />

      {/* 클릭 가능한 넓은 영역 (사용자 상호작용용) */}
      <path
        ref={(el) => {
          if (el && lineRef.current) {
            el.setAttribute('d', lineRef.current.getAttribute('d') || '');
          }
        }}
        stroke="transparent"
        strokeWidth="15" // 더 넓은 클릭 영역
        fill="none"
        onClick={handleLineClick}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          pointerEvents: 'auto', // 이 선은 클릭 이벤트를 받음
        }}
      />
    </>
  );
};
