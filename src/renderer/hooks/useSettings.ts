// src/renderer/hooks/useSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

// 초기 Settings
const initialSettings: Settings = {
  rfcList: [],
  dbConnections: [],
  selectedRfc: '',
  selectedDbId: '',
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

  // 설정 저장 함수
  const saveSettings = useCallback(
    async (settingsToSave?: Settings) => {
      if (!window.api?.saveSettings) {
        setError('설정 저장 API를 사용할 수 없습니다');
        return false;
      }

      try {
        const dataToSave = settingsToSave || settings;
        await window.api.saveSettings(dataToSave);
        return true;
      } catch (err) {
        console.error('설정 저장 실패:', err);
        setError('설정 저장에 실패했습니다');
        return false;
      }
    },
    [settings]
  );

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
      const loadedSettings = savedSettings || initialSettings;

      setSettingsState((prev) => ({
        ...prev,
        ...loadedSettings,
      }));

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

  // 초기 로딩
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 자동 저장 (autoSave가 true이고 로딩 완료된 경우)
  useEffect(() => {
    if (autoSave && !isLoading) {
      saveSettings();
    }
  }, [settings, autoSave, isLoading, saveSettings]);

  return {
    settings,
    updateSettings,
    saveSettings,
    loadSettings,
    isLoading,
    error,
  };
}
