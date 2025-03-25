// src/renderer/hooks/useSettings.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, RfcConnectionInfo, DbConnectionConfig } from '../types';

// 초기 Settings
const initialSettings: Settings = {
  rfcConnections: [], // rfcList에서 변경
  rfcFunctions: [],
  sqlList: [],
  interfaces: [],
  dbConnections: [],
  selectedRfc: '',
  selectedDbId: '',
  projects: [],
  logStoragePath: '',
};

/**
 * Settings.json 파일을 관리하는 훅
 *
 * @param partialInitialState 초기 상태 일부 덮어쓰기 (선택적)
 * @param autoSave 상태 변경 시 자동 저장 여부
 * @returns 설정 관련 상태 및 메서드
 */
export function useSettings(
  partialInitialState: Partial<Settings> = {},
  autoSave: boolean = true
) {
  // 설정 상태
  const [settings, setSettingsState] = useState<Settings>({
    ...initialSettings,
    ...partialInitialState,
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마지막으로 저장된 설정 참조
  const lastSavedSettings = useRef<Settings | null>(null);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  // 저장 대기열
  const saveQueue = useRef<Settings[]>([]);

  // 설정 불러오기 함수
  const loadSettings = useCallback(async () => {
    if (!window.api?.loadSettings) {
      setError('설정 불러오기 API를 사용할 수 없습니다');
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const savedSettings = await window.api.loadSettings();

      if (!savedSettings) {
        setSettingsState(initialSettings);
        lastSavedSettings.current = { ...initialSettings };
        return initialSettings;
      }

      // 로드된 설정에 누락된 필드가 있으면 초기값으로 채움
      // 이전 버전과의 호환성을 위해 rfcList -> rfcConnections 마이그레이션
      const loadedSettings: Settings = {
        rfcConnections:
          savedSettings.rfcConnections || savedSettings.rfcConnections || [],
        rfcFunctions: savedSettings.rfcFunctions || [],
        sqlList: savedSettings.sqlList || [],
        interfaces: savedSettings.interfaces || [],
        dbConnections: savedSettings.dbConnections || [],
        selectedRfc: savedSettings.selectedRfc || '',
        selectedDbId: savedSettings.selectedDbId || '',
        projects: (savedSettings.projects || []).map((project) => ({
          ...project,
          autoRun: false, // 모든 프로젝트의 autoRun을 false로 초기화
        })),
        logStoragePath: savedSettings.logStoragePath || '',
      };

      setSettingsState(loadedSettings);
      lastSavedSettings.current = { ...loadedSettings };

      setError(null);
      return loadedSettings;
    } catch (err) {
      console.error('설정 불러오기 실패:', err);
      setError('설정을 불러오는데 실패했습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 설정 저장 함수 (대기열 처리 포함)
  const processSaveQueue = useCallback(async () => {
    if (isSaving || saveQueue.current.length === 0) return;

    setIsSaving(true);

    try {
      // 대기열에서 가장 최신 설정 가져오기
      const latestSettings = saveQueue.current[saveQueue.current.length - 1];
      // 대기열 비우기
      saveQueue.current = [];

      if (!window.api?.saveSettings) {
        throw new Error('설정 저장 API를 사용할 수 없습니다');
      }

      console.log('설정 저장 중...', new Date().toISOString());

      // 설정 저장
      await window.api.saveSettings(latestSettings);

      console.log('설정 저장 완료', new Date().toISOString());

      // 마지막으로 저장된 설정 업데이트
      lastSavedSettings.current = { ...latestSettings };

      setError(null);

      // 대기열에 새 항목이 추가되었는지 확인하고 처리
      if (saveQueue.current.length > 0) {
        await processSaveQueue();
      }
    } catch (err) {
      console.error('설정 저장 실패:', err);
      setError('설정 저장에 실패했습니다');

      // 저장 실패 시 마지막으로 저장된 설정으로 복원
      if (lastSavedSettings.current) {
        setSettingsState(lastSavedSettings.current);
      }
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  // 설정 저장 요청 함수
  const saveSettings = useCallback(
    async (settingsToSave?: Settings) => {
      const dataToSave = settingsToSave || settings;

      // 대기열에 추가
      saveQueue.current.push({ ...dataToSave });

      // 저장 프로세스 시작
      processSaveQueue();

      return true;
    },
    [settings, processSaveQueue]
  );

  // 설정 업데이트 함수 (부분 업데이트 지원)
  const updateSettings = useCallback(
    (updater: Partial<Settings> | ((prev: Settings) => Settings)) => {
      setSettingsState((prev) => {
        // 함수형 업데이트 지원
        const newSettings =
          typeof updater === 'function'
            ? updater(prev)
            : { ...prev, ...updater };

        return newSettings;
      });
    },
    []
  );

  // 특정 설정 섹션만 업데이트하는 함수
  const updateSettingsSection = useCallback(
    <K extends keyof Settings>(
      section: K,
      updater: Settings[K] | ((prev: Settings[K]) => Settings[K])
    ) => {
      setSettingsState((prev) => {
        const newSectionValue =
          typeof updater === 'function'
            ? (updater as Function)(prev[section])
            : updater;

        return {
          ...prev,
          [section]: newSectionValue,
        };
      });
    },
    []
  );

  // 초기 로딩
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 자동 저장 (autoSave가 true이고 로딩 완료된 경우)
  useEffect(() => {
    if (
      autoSave &&
      !isLoading &&
      !isSaving &&
      lastSavedSettings.current !== null
    ) {
      // 설정이 변경되었을 때만 저장
      const currentSettingsJson = JSON.stringify(settings);
      const lastSavedSettingsJson = JSON.stringify(lastSavedSettings.current);

      if (currentSettingsJson !== lastSavedSettingsJson) {
        console.log('설정 변경 감지, 자동 저장 시작', new Date().toISOString());
        saveSettings();
      }
    }
  }, [settings, autoSave, isLoading, isSaving, saveSettings]);

  // 저장 대기열 처리
  useEffect(() => {
    if (saveQueue.current.length > 0 && !isSaving) {
      processSaveQueue();
    }
  }, [processSaveQueue, isSaving]);

  // RFC 연결 관리 헬퍼 함수
  const addRfcConnection = useCallback(
    (connection: RfcConnectionInfo) => {
      updateSettingsSection('rfcConnections', (prev) => {
        const existingIndex = prev.findIndex((c) => c.id === connection.id);
        if (existingIndex >= 0) {
          // 기존 연결 업데이트
          const updated = [...prev];
          updated[existingIndex] = connection;
          return updated;
        } else {
          // 새 연결 추가
          return [...prev, connection];
        }
      });
    },
    [updateSettingsSection]
  );

  const removeRfcConnection = useCallback(
    (id: string) => {
      updateSettingsSection('rfcConnections', (prev) =>
        prev.filter((c) => c.id !== id)
      );
    },
    [updateSettingsSection]
  );

  // DB 연결 관리 헬퍼 함수
  const addDbConnection = useCallback(
    (connection: DbConnectionConfig) => {
      updateSettingsSection('dbConnections', (prev) => {
        const existingIndex = prev.findIndex((c) => c.id === connection.id);
        if (existingIndex >= 0) {
          // 기존 연결 업데이트
          const updated = [...prev];
          updated[existingIndex] = connection;
          return updated;
        } else {
          // 새 연결 추가
          return [...prev, connection];
        }
      });
    },
    [updateSettingsSection]
  );

  const removeDbConnection = useCallback(
    (id: string) => {
      updateSettingsSection('dbConnections', (prev) =>
        prev.filter((c) => c.id !== id)
      );
    },
    [updateSettingsSection]
  );

  return {
    settings,
    updateSettings,
    updateSettingsSection,
    saveSettings,
    loadSettings,
    isLoading,
    isSaving,
    error,
    // 헬퍼 함수들
    addRfcConnection,
    removeRfcConnection,
    addDbConnection,
    removeDbConnection,
  };
}
