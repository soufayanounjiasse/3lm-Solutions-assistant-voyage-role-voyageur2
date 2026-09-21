import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SIMPLE_MODE_KEY = 'voya_simple_mode';

type AccessibilityContextValue = {
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [simpleMode, setSimpleModeState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SIMPLE_MODE_KEY).then((stored) => {
      if (stored === 'true') setSimpleModeState(true);
    });
  }, []);

  const setSimpleMode = (enabled: boolean) => {
    setSimpleModeState(enabled);
    void AsyncStorage.setItem(SIMPLE_MODE_KEY, String(enabled));
  };

  const value = useMemo(() => ({ simpleMode, setSimpleMode }), [simpleMode]);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return context;
}
