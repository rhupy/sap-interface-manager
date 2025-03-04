import React from 'react';
import { useDrag } from 'react-dnd';
import { MappingItem } from './types';

interface DraggableItemProps {
  item: MappingItem;
  isSource: boolean;
  isConnected?: boolean;
  connectionLabel?: string;
  readOnly?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSource,
  isConnected = false,
  connectionLabel,
  readOnly = false,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PARAMETER',
    item: () => ({ ...item, isSource }),
    canDrag: !readOnly,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      id={`mapping-item-${item.id}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: !readOnly ? 'grab' : 'default',
        padding: '8px 12px',
        margin: '4px 0',
        backgroundColor: isConnected ? '#d1ecf1' : '#f8f9fa',
        borderRadius: '4px',
        border: `1px solid ${isConnected ? '#bee5eb' : '#ddd'}`,
        position: 'relative',
        userSelect: 'none', // 텍스트 선택 방지
      }}
    >
      <div>{item.label}</div>
      {isConnected && connectionLabel && (
        <div style={{ fontSize: '0.8rem', color: '#0c5460', marginTop: '2px' }}>
          {isSource ? '→ ' : '← '}
          {connectionLabel}
        </div>
      )}
      <div
        className="connection-point"
        style={{
          position: 'absolute',
          top: '50%',
          [isSource ? 'right' : 'left']: '-5px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#17a2b8' : '#6c757d',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
};
