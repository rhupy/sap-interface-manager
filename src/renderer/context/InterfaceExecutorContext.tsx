import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  InterfaceInfo,
  InterfaceStep,
  RfcConnectionInfo,
  DbConnectionConfig,
  RfcFunctionInfo,
  SqlInfo,
  ExecutionLog,
  ExecutionState,
} from '../types';
import { useMessage } from './MessageContext';
import { sql } from 'sql-formatter';

// 컨텍스트 타입 정의
interface InterfaceExecutorContextType {
  executionState: ExecutionState;
  executeInterface: (
    interfaceInfo: InterfaceInfo,
    rfcFunctions: RfcFunctionInfo[],
    sqlList: SqlInfo[],
    sapConnection?: RfcConnectionInfo,
    dbConnection?: DbConnectionConfig
  ) => Promise<void>;
  clearLogs: () => void;
  addLog: (log: Omit<ExecutionLog, 'timestamp'>) => void;
}

// 초기 실행 상태
const initialExecutionState: ExecutionState = {
  isRunning: false,
  currentStepIndex: -1,
  logs: [],
  results: [],
};

// 컨텍스트 생성
const InterfaceExecutorContext = createContext<
  InterfaceExecutorContextType | undefined
>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const InterfaceExecutorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [executionState, setExecutionState] = useState<ExecutionState>(
    initialExecutionState
  );
  const { showMessage } = useMessage();

  // 로그 추가 함수
  const addLog = useCallback((log: Omit<ExecutionLog, 'timestamp'>) => {
    const timestamp = new Date().toISOString();
    setExecutionState((prev) => ({
      ...prev,
      logs: [...prev.logs, { ...log, timestamp }],
    }));
  }, []);

  // 로그 초기화 함수
  const clearLogs = useCallback(() => {
    setExecutionState((prev) => ({
      ...prev,
      logs: [],
      results: [],
      error: undefined,
    }));
  }, []);

  // 인터페이스 실행 함수
  const executeInterface = useCallback(
    async (
      interfaceInfo: InterfaceInfo,
      rfcFunctions: RfcFunctionInfo[],
      sqlList: SqlInfo[],
      sapConnection?: RfcConnectionInfo,
      dbConnection?: DbConnectionConfig
    ) => {
      // 실행 시작
      setExecutionState({
        isRunning: true,
        currentStepIndex: -1,
        logs: [],
        results: [],
      });

      addLog({
        level: 'info',
        message: `인터페이스 '${interfaceInfo.name}' 실행 시작`,
      });

      try {
        const results: any[] = [];
        const parameterValues: Record<string, any> = {};

        // 각 단계 순차적으로 실행
        for (let i = 0; i < interfaceInfo.steps.length; i++) {
          const step = interfaceInfo.steps[i];
          setExecutionState((prev) => ({ ...prev, currentStepIndex: i }));

          // addLog({
          //   level: 'info',
          //   message: `단계 ${i + 1} 실행: ${step.type === 'rfc' ? 'RFC' : 'SQL'} (${step.name})`,
          // });

          // 파라미터 매핑 처리
          const mappedParameters: Record<string, any> = {};
          if (step.parameters) {
            for (const [paramName, paramValue] of Object.entries(
              step.parameters
            )) {
              // 이전 단계의 결과를 참조하는 경우 (예: "1.DATA1")
              if (typeof paramValue === 'string' && paramValue.includes('.')) {
                const [stepIndex, resultKey] = paramValue.split('.');
                const stepResult = results[parseInt(stepIndex) - 1];
                if (stepResult && stepResult[resultKey] !== undefined) {
                  mappedParameters[paramName] = stepResult[resultKey];
                } else {
                  mappedParameters[paramName] = null;
                  addLog({
                    level: 'warning',
                    message: `파라미터 매핑 경고: ${paramValue}를 찾을 수 없습니다.`,
                  });
                }
              } else {
                // 상수 값인 경우
                mappedParameters[paramName] = paramValue;
              }
            }
          }

          // 단계 실행 (RFC 또는 SQL)
          let stepResult;
          if (step.type === 'rfc') {
            if (!sapConnection) {
              throw new Error('SAP 연결이 선택되지 않았습니다.');
            }

            // RFC 함수 정보 찾기
            const rfcFunction = rfcFunctions.find(
              (func) => func.id === step.referenceId
            );
            if (!rfcFunction) {
              throw new Error(`RFC 함수 정보를 찾을 수 없습니다: ${step.name}`);
            }

            // RFC 함수 실행
            addLog({
              level: 'info',
              message: `RFC 함수 '${rfcFunction.functionName}' 호출 중...`,
              details: { parameters: mappedParameters },
            });

            if (!window.api?.testRfcFunction) {
              throw new Error('RFC 함수 실행 API를 사용할 수 없습니다.');
            }

            const result = await window.api.testRfcFunction({
              connection: sapConnection,
              functionName: rfcFunction.functionName,
              parameters: mappedParameters,
            });

            if (!result.success) {
              throw new Error(`RFC 함수 실행 실패: ${result.message}`);
            }

            stepResult = result.data || {};
          } else if (step.type === 'sql') {
            if (!dbConnection) {
              throw new Error('DB 연결이 선택되지 않았습니다.');
            }

            // SQL 정보 찾기
            const sqlInfo = sqlList.find((sql) => sql.id === step.referenceId);
            if (!sqlInfo) {
              throw new Error(
                `SQL 정보를 찾을 수 없습니다: ${step.referenceId}`
              );
            }

            // SQL 쿼리 실행
            let query = sqlInfo.sqlText;

            // SQL 파라미터 치환
            for (const [paramName, paramValue] of Object.entries(
              mappedParameters
            )) {
              const paramRegex = new RegExp(`:${paramName}`, 'g');
              const formattedValue =
                typeof paramValue === 'string'
                  ? `'${paramValue.replace(/'/g, "''")}'`
                  : paramValue;

              query = query.replace(
                paramRegex,
                formattedValue !== null ? String(formattedValue) : 'NULL'
              );
            }

            // 쿼리 끝의 세미콜론 제거
            query = query.replace(/;\s*$/, '').replace(/\s+/g, ' ').trim();

            addLog({
              level: 'info',
              message: `SQL 실행 : ${sqlInfo.name}`,
            });

            // SQL 실행 API가 없으므로 추가 필요
            if (!window.api?.executeSql) {
              throw new Error('SQL 실행 API를 사용할 수 없습니다.');
            }

            const result = await window.api.executeSql({
              connection: dbConnection,
              query,
            });

            if (!result.success) {
              throw new Error(`SQL 실행 실패: ${result.message}`);
            }

            stepResult = result.data || {};
          } else {
            throw new Error(`지원하지 않는 단계 유형: ${step.type}`);
          }

          // 결과 저장
          results.push(stepResult);

          addLog({
            level: 'success',
            message: `단계 ${i + 1} 실행 완료 : ${step.name}`,
            details: { result: stepResult },
          });
        }

        // 모든 단계 실행 완료
        setExecutionState((prev) => ({
          ...prev,
          isRunning: false,
          results,
        }));

        addLog({
          level: 'success',
          message: `인터페이스 '${interfaceInfo.name}' 실행 완료`,
        });

        showMessage(
          `인터페이스 '${interfaceInfo.name}' 실행이 완료되었습니다.`,
          'success'
        );
      } catch (error: any) {
        // 오류 처리
        setExecutionState((prev) => ({
          ...prev,
          isRunning: false,
          error: error.message,
        }));

        addLog({
          level: 'error',
          message: `인터페이스 실행 오류: ${error.message}`,
          details: error,
        });

        showMessage(`인터페이스 실행 오류: ${error.message}`, 'error');
      }
    },
    [addLog, showMessage]
  );

  return (
    <InterfaceExecutorContext.Provider
      value={{
        executionState,
        executeInterface,
        clearLogs,
        addLog,
      }}
    >
      {children}
    </InterfaceExecutorContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useInterfaceExecutor = () => {
  const context = useContext(InterfaceExecutorContext);
  if (context === undefined) {
    throw new Error(
      'useInterfaceExecutor must be used within an InterfaceExecutorProvider'
    );
  }
  return context;
};
