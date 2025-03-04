import React, { useEffect } from 'react';
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
    console.log('Connecting:', sourceItem.label, 'to', targetItem.label);

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
    console.log('Deleting connection:', connectionId);

    if (onDeleteConnection) {
      onDeleteConnection(connectionId);
    } else {
      onConnectionsChange(
        connections.filter((conn) => conn.id !== connectionId)
      );
    }
  };

  // 디버깅용 로그
  useEffect(() => {
    console.log('Source items:', sourceItems);
    console.log('Target items:', targetItems);
    console.log('Connections:', connections);
  }, [sourceItems, targetItems, connections]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          position: 'relative',
          minHeight: '400px',
          ...containerStyle,
        }}
      >
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 1,
            overflow: 'visible',
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 소스 아이템 (출력 파라미터) */}
          <div style={{ width: '45%' }}>
            <h4>{sourceTitle}</h4>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
              }}
            >
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
              {sourceItems.length === 0 && (
                <div style={{ padding: '8px', color: '#6c757d' }}>
                  출력 파라미터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 타겟 아이템 (입력 파라미터) */}
          <div style={{ width: '45%' }}>
            <h4>{targetTitle}</h4>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
              }}
            >
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
              {targetItems.length === 0 && (
                <div style={{ padding: '8px', color: '#6c757d' }}>
                  입력 파라미터가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
