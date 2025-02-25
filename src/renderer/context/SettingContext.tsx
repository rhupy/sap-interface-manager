// src/renderer/context/SettingsContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Settings } from '../types/index';

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: Settings;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
