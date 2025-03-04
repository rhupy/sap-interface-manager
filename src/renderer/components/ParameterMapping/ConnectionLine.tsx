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

  const updateLine = () => {
    try {
      const sourceEl = document.getElementById(
        `mapping-item-${connection.sourceId}`
      );
      const targetEl = document.getElementById(
        `mapping-item-${connection.targetId}`
      );

      if (!sourceEl || !targetEl || !lineRef.current) {
        return;
      }

      const sourcePoint = sourceEl.querySelector('.connection-point');
      const targetPoint = targetEl.querySelector('.connection-point');

      if (!sourcePoint || !targetPoint) {
        return;
      }

      const sourceRect = sourcePoint.getBoundingClientRect();
      const targetRect = targetPoint.getBoundingClientRect();

      const svgEl = lineRef.current.ownerSVGElement;
      if (!svgEl) {
        return;
      }

      const svgRect = svgEl.getBoundingClientRect();

      // 시작점과 끝점 계산
      const x1 = sourceRect.left + sourceRect.width / 2 - svgRect.left;
      const y1 = sourceRect.top + sourceRect.height / 2 - svgRect.top;
      const x2 = targetRect.left + targetRect.width / 2 - svgRect.left;
      const y2 = targetRect.top + targetRect.height / 2 - svgRect.top;

      // 베지어 곡선으로 선 그리기
      const dx = Math.abs(x2 - x1) * 0.5;
      const newPath = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      lineRef.current.setAttribute('d', newPath);
    } catch (error) {
      console.error('Error updating line:', error);
    }
  };

  useEffect(() => {
    // 초기 렌더링 후 약간의 지연을 두고 선 업데이트
    const initialTimer = setTimeout(() => {
      updateLine();
    }, 100);

    // 윈도우 리사이즈 시 선 업데이트
    window.addEventListener('resize', updateLine);

    // 주기적으로 선 업데이트 (DOM 변경 감지를 위해)
    const intervalTimer = setInterval(updateLine, 500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('resize', updateLine);
    };
  }, [connection]);

  // 초기 경로 (나중에 업데이트됨)
  const initialPath = 'M 0 0 C 0 0, 0 0, 0 0';

  return (
    <path
      ref={lineRef}
      d={initialPath}
      stroke="#4a90e2"
      strokeWidth="2"
      fill="none"
    />
  );
};
