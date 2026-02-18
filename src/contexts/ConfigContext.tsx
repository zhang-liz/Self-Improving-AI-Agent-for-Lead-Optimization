import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConfig, updateConfig, type ScoringConfig } from '../services/configService';

interface ConfigContextValue {
  config: ScoringConfig | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (patch: Partial<ScoringConfig>) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    const c = await getConfig();
    setConfig(c);
  }, []);

  const handleUpdateConfig = useCallback(async (patch: Partial<ScoringConfig>) => {
    const updated = await updateConfig(patch);
    if (updated) setConfig(updated);
  }, []);

  useEffect(() => {
    refreshConfig().finally(() => setLoading(false));
  }, [refreshConfig]);

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig, updateConfig: handleUpdateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
