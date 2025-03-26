// src/components/InterfaceExecutor.tsx

import React, { useState } from 'react';
import { useInterfaceExecutor } from '../context/InterfaceExecutorContext';
import {
  InterfaceInfo,
  RfcConnectionInfo,
  DbConnectionConfig,
  ExecutionLog,
} from '../types';
import { Button, Select, LeftAlignedLabel } from '../styles/CommonStyles';
import LogDisplay from './LogDisplay';

interface InterfaceExecutorProps {
  interface: InterfaceInfo;
  sapConnections: RfcConnectionInfo[];
  dbConnections: DbConnectionConfig[];
  selectedSapConnection?: string;
  selectedDbConnection?: string;
  onConnectionChange?: (type: 'sap' | 'db', connectionName: string) => void;
  showConnectionSelectors?: boolean;
  autoStart?: boolean;
  showLogs?: boolean;
  rfcFunctions: any[];
  sqlList: any[];
}

export const InterfaceExecutor: React.FC<InterfaceExecutorProps> = ({
  interface: interfaceDefinition,
  sapConnections,
  dbConnections,
  selectedSapConnection,
  selectedDbConnection,
  onConnectionChange,
  showConnectionSelectors = false,
  autoStart = false,
  showLogs = true,
  rfcFunctions,
  sqlList,
}) => {
  const { executionState, executeInterface, clearLogs } =
    useInterfaceExecutor();
  const [localSapConnection, setLocalSapConnection] = useState(
    selectedSapConnection || ''
  );
  const [localDbConnection, setLocalDbConnection] = useState(
    selectedDbConnection || ''
  );

  const sapConnection = selectedSapConnection || localSapConnection;
  const dbConnection = selectedDbConnection || localDbConnection;

  const handleSapConnectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setLocalSapConnection(value);
    if (onConnectionChange) {
      onConnectionChange('sap', value);
    }
  };

  const handleDbConnectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setLocalDbConnection(value);
    if (onConnectionChange) {
      onConnectionChange('db', value);
    }
  };

  const handleExecute = async () => {
    clearLogs();

    const sapConfig = sapConnections.find(
      (conn) => conn.connectionName === sapConnection
    );
    const dbConfig = dbConnections.find(
      (conn) => conn.connectionName === dbConnection
    );

    await executeInterface(
      interfaceDefinition,
      rfcFunctions, // props에서 받은 rfcFunctions 사용
      sqlList, // props에서 받은 sqlList 사용
      sapConfig,
      dbConfig
    );

    // 예시 로그 추가
    const log: ExecutionLog = {
      level: 'info', // 'info', 'success', 'error', 'warning' 중 하나로 설정
      timestamp: new Date().toISOString(),
      message: `[${interfaceDefinition.name}] 실행 시작`,
      details: interfaceDefinition.steps,
    };
    executionState.logs.push(log); // 로그를 상태에 추가
  };

  return (
    <div>
      {showConnectionSelectors && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div>
            <LeftAlignedLabel>테스트 SAP 연결</LeftAlignedLabel>
            <Select
              value={sapConnection}
              onChange={handleSapConnectionChange}
              style={{ width: '180px' }}
            >
              <option value="">SAP 연결 선택</option>
              {sapConnections.map((conn) => (
                <option key={conn.connectionName} value={conn.connectionName}>
                  {conn.connectionName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <LeftAlignedLabel>테스트 DB 연결</LeftAlignedLabel>
            <Select
              value={dbConnection}
              onChange={handleDbConnectionChange}
              style={{ width: '180px' }}
            >
              <option value="">DB 연결 선택</option>
              {dbConnections.map((conn) => (
                <option key={conn.id} value={conn.connectionName}>
                  {conn.connectionName}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          onClick={handleExecute}
          disabled={
            executionState.isRunning || (!sapConnection && !dbConnection)
          }
          style={{
            backgroundColor: executionState.isRunning ? '#6c757d' : '#28a745',
            padding: '5px 15px',
          }}
        >
          {executionState.isRunning ? '실행 중...' : '인터페이스 테스트 실행'}
        </Button>

        {executionState.isRunning && (
          <div>
            단계 {executionState.currentStepIndex + 1}/
            {interfaceDefinition.steps.length} 실행 중...
          </div>
        )}
      </div>

      {showLogs && (
        <LogDisplay logs={executionState.logs} clearLogs={clearLogs} />
      )}
    </div>
  );
};
