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

  // 파라미터 중복 제거 로직 추가
  const getUniqueTargetItems = (items: MappingItem[]) => {
    const uniqueItems: MappingItem[] = [];
    const seenIds = new Set();

    items.forEach((item) => {
      // 파라미터 이름(ID)만 추출 (예: DATA1)
      const paramName = item.id;

      // 이미 처리한 파라미터인지 확인
      if (!seenIds.has(paramName)) {
        seenIds.add(paramName);
        uniqueItems.push(item);
      }
    });

    return uniqueItems;
  };

  // 기존 targetItems 대신 중복이 제거된 uniqueTargetItems 사용
  const uniqueTargetItems = getUniqueTargetItems(targetItems);

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
            zIndex: 1,
            overflow: 'visible',
            pointerEvents: 'none', // SVG 자체는 포인터 이벤트를 받지 않음
          }}
        >
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
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
                padding: '8px',
                backgroundColor: 'transparent', // 배경색 투명으로 변경
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
                padding: '8px',
                backgroundColor: 'transparent', // 배경색 투명으로 변경
              }}
            >
              {uniqueTargetItems.map((item) => {
                const connection = connections.find(
                  (conn) => conn.targetId === item.id
                );
                return (
                  <DroppableItem
                    key={item.id}
                    item={item}
                    onConnect={handleConnect}
                    onRemoveMapping={(targetId) => {
                      const connectionToRemove = connections.find(
                        (conn) => conn.targetId === targetId
                      );
                      if (connectionToRemove) {
                        handleDeleteConnection(connectionToRemove.id);
                      }
                    }}
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
