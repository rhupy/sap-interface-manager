// src/renderer/contexts/SettingsContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { Settings } from '../types';
import { useSettings } from '../hooks/useSettings';

// 컨텍스트 타입 정의
interface SettingsContextType {
  settings: Settings;
  updateSettings: (
    updater: Partial<Settings> | ((prev: Settings) => Settings)
  ) => void;
  saveSettings: (settingsToSave?: Settings) => Promise<boolean>;
  loadSettings: () => Promise<Settings | null>;
  isLoading: boolean;
  error: string | null;
}

// 컨텍스트 생성
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// 컨텍스트 제공자 컴포넌트
interface SettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<Settings>;
  autoSave?: boolean;
}

export function SettingsProvider({
  children,
  initialSettings = {},
  autoSave = true,
}: SettingsProviderProps) {
  const settingsData = useSettings(initialSettings, autoSave);

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  );
}

// 컨텍스트 사용 훅
export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error(
      'useSettingsContext는 SettingsProvider 내부에서 사용해야 합니다'
    );
  }

  return context;
}
