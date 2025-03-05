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

  // 다중 데이터 매핑 여부 확인 함수
  function hasMultiDataMapping(step: InterfaceStep, prevResult: any): boolean {
    if (!step.parameters || !prevResult) return false;

    // 매핑 정보 확인
    for (const [paramName, mappedFrom] of Object.entries(step.parameters)) {
      const parts = mappedFrom.split('.');
      if (parts.length >= 3) {
        // 작업명.테이블명.컬럼명 형태
        const jobName = parts[0];
        const tableName = parts[1];

        // prevResult에서 해당 테이블이 배열인지 확인
        if (
          prevResult.originalResult &&
          prevResult.originalResult[tableName] &&
          Array.isArray(prevResult.originalResult[tableName]) &&
          prevResult.originalResult[tableName].length > 0
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // 다중 데이터 매핑 정보 추출 함수
  function extractMultiDataInfo(
    step: InterfaceStep,
    prevResult: any
  ): {
    tableName: string;
    data: any[];
    mappingInfo: Record<string, string>;
  } | null {
    if (!step.parameters || !prevResult) return null;

    // 매핑 정보 확인
    for (const [paramName, mappedFrom] of Object.entries(step.parameters)) {
      const parts = mappedFrom.split('.');
      if (parts.length >= 3) {
        // 작업명.테이블명.컬럼명 형태
        const jobName = parts[0];
        const tableName = parts[1];

        // prevResult에서 해당 테이블이 배열인지 확인
        if (
          prevResult.originalResult &&
          prevResult.originalResult[tableName] &&
          Array.isArray(prevResult.originalResult[tableName]) &&
          prevResult.originalResult[tableName].length > 0
        ) {
          // 매핑 정보 구성
          const mappingInfo: Record<string, string> = {};

          // 모든 파라미터에 대해 매핑 정보 추출
          for (const [pName, pMappedFrom] of Object.entries(step.parameters)) {
            const pParts = pMappedFrom.split('.');
            if (
              pParts.length >= 3 &&
              pParts[0] === jobName &&
              pParts[1] === tableName
            ) {
              // DATA3 -> ZWMS_SC_VENDOR.OUTTAB.MATNR 형태의 매핑에서 MATNR 추출
              mappingInfo[pName] = pParts[2];
            }
          }

          return {
            tableName,
            data: prevResult.originalResult[tableName],
            mappingInfo,
          };
        }
      }
    }

    return null;
  }

  // 다중 데이터 SQL 실행 함수
  async function executeMultiDataSql(
    connection: any,
    sqlTemplate: string,
    tableData: any[],
    mappingInfo: Record<string, string>,
    regularParams: Record<string, any> = {} // 일반 매핑 파라미터 추가
  ): Promise<any> {
    // 컬럼 매핑 정보를 JSON으로 변환
    const mappingsJson = Object.entries(mappingInfo).map(
      ([paramName, jsonPath]) => ({
        param_name: paramName,
        json_path: jsonPath,
      })
    );

    // 일반 파라미터 정보를 JSON으로 변환
    const regularParamsJson = Object.entries(regularParams).map(
      ([paramName, paramValue]) => ({
        param_name: paramName,
        param_value: paramValue,
      })
    );

    // 프로시저 호출 SQL 생성
    const procedureCall = `
    BEGIN
      EXEC_MULTI_DATA_SQL(
        p_json_data => '${JSON.stringify(tableData).replace(/'/g, "''")}',
        p_sql_template => '${sqlTemplate.replace(/'/g, "''")}',
        p_column_mappings => '${JSON.stringify(mappingsJson).replace(/'/g, "''")}'
        ${regularParamsJson.length > 0 ? `,p_regular_params => '${JSON.stringify(regularParamsJson).replace(/'/g, "''")}'` : ''}
      );
    END;
    `;

    console.log('다중 데이터 처리 프로시저 호출:', procedureCall);

    if (!window.api?.executeSql) {
      throw new Error('다중 데이터 SQL 을 사용할 수 없습니다.');
    }

    // 프로시저 호출
    return await window.api.executeSql({
      connection,
      query: procedureCall,
    });
  }

  // 매핑된 값 가져오기 함수
  function getMappedValue(data: any, path: string): string {
    if (!data) return 'NULL';

    const parts = path.split('.');
    let value = data;

    for (const part of parts) {
      if (value === undefined || value === null) return 'NULL';
      value = value[part];
    }

    if (value === undefined || value === null) return 'NULL';

    // 값 타입에 따른 처리
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'number') {
      return value.toString();
    } else if (value instanceof Date) {
      return `TO_DATE('${value.toISOString().split('T')[0]}', 'YYYY-MM-DD')`;
    } else {
      return `'${String(value).replace(/'/g, "''")}'`;
    }
  }

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

          // 파라미터 매핑 처리
          const mappedParameters: Record<string, any> = {};
          if (step.parameters) {
            for (const [paramName, paramValue] of Object.entries(
              step.parameters
            )) {
              // 이전 단계의 결과를 참조하는 경우
              if (typeof paramValue === 'string' && paramValue.includes('.')) {
                // 첫 번째 부분은 단계 ID 또는 인덱스
                const [stepIdentifier, ...pathParts] = paramValue.split('.');
                const path = pathParts.join('.');

                // 단계 인덱스로 참조하는 경우 (숫자인 경우)
                if (/^\d+$/.test(stepIdentifier)) {
                  const stepIndex = parseInt(stepIdentifier) - 1;
                  const stepResult = results[stepIndex];

                  if (stepResult && path) {
                    // 중첩된 경로 처리
                    let value = stepResult;
                    const parts = path.split('.');
                    let found = true;

                    for (const part of parts) {
                      if (value && typeof value === 'object' && part in value) {
                        value = value[part];
                      } else {
                        found = false;
                        addLog({
                          level: 'warning',
                          message: `파라미터 매핑 경고: ${paramValue}를 찾을 수 없습니다.`,
                        });
                        break;
                      }
                    }

                    if (found) {
                      mappedParameters[paramName] = value;
                    } else {
                      mappedParameters[paramName] = null;
                    }
                  } else {
                    mappedParameters[paramName] = null;
                    addLog({
                      level: 'warning',
                      message: `파라미터 매핑 경고: ${paramValue}를 찾을 수 없습니다.`,
                    });
                  }
                }
                // 단계 ID로 참조하는 경우
                else {
                  // 단계 ID로 결과 찾기
                  const stepIndex = interfaceInfo.steps.findIndex(
                    (s) => s.id === stepIdentifier || s.name === stepIdentifier
                  );

                  if (stepIndex >= 0 && results[stepIndex]) {
                    // 중첩된 경로 처리
                    let value = results[stepIndex];
                    const parts = path.split('.');
                    let found = true;

                    for (const part of parts) {
                      if (value && typeof value === 'object' && part in value) {
                        value = value[part];
                      } else {
                        found = false;
                        addLog({
                          level: 'warning',
                          message: `파라미터 매핑 경고: ${stepIdentifier}.${path}를 찾을 수 없습니다.`,
                        });
                        break;
                      }
                    }

                    if (found) {
                      mappedParameters[paramName] = value;
                    } else {
                      mappedParameters[paramName] = null;
                    }
                  } else {
                    mappedParameters[paramName] = null;
                    addLog({
                      level: 'warning',
                      message: `파라미터 매핑 경고: ${paramValue}를 찾을 수 없습니다.`,
                    });
                  }
                }
              } else {
                // 상수 값인 경우
                mappedParameters[paramName] = paramValue;
              }
            }
          }

          // 단계 유형에 따라 실행
          let stepResult: any = {};

          // RFC 작업 실행 ---------------------------------------------------------------
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

            // 결과 처리: RETURN 구조체의 모든 필드를 최상위로 복사
            const processedResult = { ...result.data };

            // RETURN 구조체의 필드를 최상위로 복사
            if (processedResult.RETURN) {
              // 각 필드를 최상위로 복사
              for (const field of Object.keys(processedResult.RETURN)) {
                processedResult[field] = processedResult.RETURN[field];
              }
            }

            // 원본 결과도 유지
            processedResult.originalResult = result.data;

            stepResult = processedResult;
          } else if (step.type === 'sql') {
            // SQL 작업 실행 ---------------------------------------------------------------
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

            // 이전 단계의 결과 가져오기 (i > 0인 경우에만)
            const prevResult = i > 0 ? results[i - 1] : null;

            // 다중 데이터 매핑 여부 확인
            const hasMultiData = hasMultiDataMapping(step, prevResult);

            if (hasMultiData) {
              // 다중 데이터 정보 추출
              const multiDataInfo = extractMultiDataInfo(step, prevResult);

              if (multiDataInfo) {
                addLog({
                  level: 'info',
                  message: `다중 데이터 SQL 실행 : ${sqlInfo.name} (${multiDataInfo.data.length}개 행)`,
                });

                // 쿼리 끝의 세미콜론 제거
                query = query.replace(/;\s*$/, '');

                // 일반 매핑 파라미터 추출
                const regularParams: Record<string, any> = {};
                for (const [paramName, paramValue] of Object.entries(
                  mappedParameters
                )) {
                  // 다중 데이터 매핑이 아닌 파라미터만 추가
                  if (
                    !Object.keys(multiDataInfo.mappingInfo).includes(paramName)
                  ) {
                    regularParams[paramName] = paramValue;
                  }
                }

                // 다중 데이터 SQL 실행
                const result = await executeMultiDataSql(
                  dbConnection,
                  query,
                  multiDataInfo.data,
                  multiDataInfo.mappingInfo,
                  regularParams // 일반 매핑 파라미터 전달
                );

                if (!result.success) {
                  throw new Error(
                    `다중 데이터 SQL 실행 실패: ${result.message}`
                  );
                }

                stepResult = {
                  message: `${multiDataInfo.data.length}개 행에 대한 SQL 실행 완료`,
                  rowCount: multiDataInfo.data.length,
                  ...result.data,
                };

                // 결과 저장
                results.push(stepResult);

                addLog({
                  level: 'success',
                  message: `단계 ${i + 1} 실행 완료 : ${step.name}`,
                  details: { result: stepResult },
                });

                // 다음 단계로 진행
                continue;
              }
            }

            // 일반 SQL 실행
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
            query = query.replace(/;\s*$/, '');

            addLog({
              level: 'info',
              message: `SQL 실행 : ${sqlInfo.name}`,
            });

            if (!window.api?.executeSql) {
              throw new Error('SQL 실행 API를 사용할 수 없습니다.');
            }

            const parsedQuery = parseQuery(query);

            const result = await window.api.executeSql({
              connection: dbConnection,
              query: parsedQuery,
            });

            if (!result.success) {
              throw new Error(`SQL 실행 실패: ${result.message}`);
            }

            stepResult = result.data || {};
          }
          // RFC / SQL 종료 ---------------------------------------------------------------
          else {
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

  // 쿼리 파싱
  function parseQuery(query: string): string {
    console.log('파싱 전 쿼리:', query);

    // :'값' 형식을 '값'으로 변환
    let parsedQuery = query.replace(/:'([^']*)'/g, "'$1'");

    // :숫자 형식을 숫자로 변환
    parsedQuery = parsedQuery.replace(/:(\d+(\.\d+)?)/g, '$1');

    // :NULL 형식을 NULL로 변환
    parsedQuery = parsedQuery.replace(/:NULL/gi, 'NULL');

    // :SYSDATE 형식을 SYSDATE로 변환
    parsedQuery = parsedQuery.replace(/:SYSDATE/gi, 'SYSDATE');

    console.log('파싱 후 쿼리:', parsedQuery);
    return parsedQuery;
  }

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
