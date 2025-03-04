import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableItem } from './DraggableItem';
import { DroppableItem } from './DroppableItem';
import { ConnectionLine } from './ConnectionLine';
import { ParameterMappingProps, MappingItem, MappingConnection } from './types';

export const ParameterMappingCanvas: React.FC<ParameterMappingProps> = ({
  sourceItems,
  targetItems,
  connections,
  onConnectionsChange,
  onDeleteConnection,
  sourceTitle = '출력 파라미터',
  targetTitle = '입력 파라미터',
  readOnly = false,
  containerStyle = {},
}) => {
  const handleConnect = (sourceItem: MappingItem, targetItem: MappingItem) => {
    // 이미 연결된 타겟이 있으면 제거
    const filteredConnections = connections.filter(
      (conn) => conn.targetId !== targetItem.id
    );

    // 새 연결 추가
    const newConnection: MappingConnection = {
      id: `${sourceItem.id}-${targetItem.id}`,
      sourceId: sourceItem.id,
      targetId: targetItem.id,
      sourceLabel: sourceItem.label,
      targetLabel: targetItem.label,
    };

    onConnectionsChange([...filteredConnections, newConnection]);
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (onDeleteConnection) {
      onDeleteConnection(connectionId);
    } else {
      onConnectionsChange(
        connections.filter((conn) => conn.id !== connectionId)
      );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ position: 'relative', ...containerStyle }}>
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 1,
          }}
        >
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              onDelete={handleDeleteConnection}
              readOnly={readOnly}
            />
          ))}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* 소스 아이템 (출력 파라미터) */}
          <div style={{ width: '45%' }}>
            <h4>{sourceTitle}</h4>
            {sourceItems.map((item) => {
              const connection = connections.find(
                (conn) => conn.sourceId === item.id
              );
              return (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isSource={true}
                  isConnected={!!connection}
                  connectionLabel={connection?.targetLabel}
                  readOnly={readOnly}
                />
              );
            })}
          </div>

          {/* 타겟 아이템 (입력 파라미터) */}
          <div style={{ width: '45%' }}>
            <h4>{targetTitle}</h4>
            {targetItems.map((item) => {
              const connection = connections.find(
                (conn) => conn.targetId === item.id
              );
              return (
                <DroppableItem
                  key={item.id}
                  item={item}
                  onConnect={handleConnect}
                  isConnected={!!connection}
                  connectionLabel={connection?.sourceLabel}
                  readOnly={readOnly}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
