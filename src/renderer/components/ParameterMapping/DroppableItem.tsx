import React from 'react';
import { useDrop } from 'react-dnd';
import { MappingItem } from './types';

interface DroppableItemProps {
  item: MappingItem;
  onConnect: (sourceItem: MappingItem, targetItem: MappingItem) => void;
  isConnected?: boolean;
  connectionLabel?: string;
  readOnly?: boolean;
}

export const DroppableItem: React.FC<DroppableItemProps> = ({
  item,
  onConnect,
  isConnected = false,
  connectionLabel,
  readOnly = false,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'PARAMETER',
    drop: (droppedItem: MappingItem & { isSource: boolean }) => {
      console.log('Item dropped:', droppedItem);
      onConnect(droppedItem, item);
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
        userSelect: 'none',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      <div>{item.label}</div>
      {isConnected && connectionLabel && (
        <div style={{ fontSize: '0.8rem', color: '#0c5460', marginTop: '2px' }}>
          ← {connectionLabel}
        </div>
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
