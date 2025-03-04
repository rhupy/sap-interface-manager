import React from 'react';
import { useDrop } from 'react-dnd';
import { MappingItem } from './types';

interface DroppableItemProps {
  item: MappingItem;
  onConnect: (sourceItem: MappingItem, targetItem: MappingItem) => void;
  onRemoveMapping?: (targetId: string) => void; // 매핑 제거 함수 추가
  isConnected?: boolean;
  connectionLabel?: string;
  readOnly?: boolean;
}

export const DroppableItem: React.FC<DroppableItemProps> = ({
  item,
  onConnect,
  onRemoveMapping,
  isConnected = false,
  connectionLabel,
  readOnly = false,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'PARAMETER',
    drop: (droppedItem: MappingItem & { isSource: boolean }) => {
      if (droppedItem.isSource) {
        onConnect(droppedItem, item);
      }
      return { dropped: true };
    },
    canDrop: (droppedItem: MappingItem & { isSource: boolean }) => {
      return !readOnly && droppedItem.isSource;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const handleRemoveMapping = () => {
    if (!readOnly && onRemoveMapping && isConnected) {
      onRemoveMapping(item.id);
    }
  };

  return (
    <div
      ref={drop}
      id={`mapping-item-${item.id}`}
      style={{
        padding: '8px 12px',
        margin: '4px 0',
        backgroundColor:
          isOver && canDrop ? '#d1ecf1' : isConnected ? '#e8f4f8' : '#f8f9fa',
        borderRadius: '4px',
        border: `1px solid ${isOver && canDrop ? '#bee5eb' : isConnected ? '#b8d0e0' : '#ddd'}`,
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1 }}>
        <div>{item.label}</div>
        {isConnected && connectionLabel && (
          <div
            style={{ fontSize: '0.8rem', color: '#0c5460', marginTop: '2px' }}
          >
            ← {connectionLabel}
          </div>
        )}
      </div>

      {/* 매핑 제거 버튼 */}
      {isConnected && !readOnly && (
        <button
          onClick={handleRemoveMapping}
          style={{
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
          title="매핑 제거"
        >
          매핑 제거
        </button>
      )}

      <div
        className="connection-point"
        style={{
          position: 'absolute',
          top: '50%',
          left: '-5px',
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
