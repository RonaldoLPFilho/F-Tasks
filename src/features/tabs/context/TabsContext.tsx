import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Tab } from "../types/Tab";
import {
  getTabs,
  createTab as createTabApi,
  deleteTab as deleteTabApi,
} from "../services/TabService";

interface TabsContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  loading: boolean;
  error: string | null;
  loadTabs: () => Promise<void>;
  selectTab: (tabId: string) => void;
  createTab: (name: string) => Promise<Tab | null>;
  removeTab: (tabId: string, password?: string) => Promise<boolean>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProviderProps {
  children: ReactNode;
}

export function TabsProvider({ children }: TabsProviderProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTabs();
      setTabs(data);
      setActiveTabId((prev) => {
        if (prev && data.some((t) => t.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar abas");
      setTabs([]);
      setActiveTabId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabs();
  }, [loadTabs]);

  const selectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const createTab = useCallback(async (name: string): Promise<Tab | null> => {
    try {
      const tab = await createTabApi(name.trim());
      setTabs((prev) => [...prev, tab].sort((a, b) => a.sortOrder - b.sortOrder));
      setActiveTabId(tab.id);
      return tab;
    } catch {
      return null;
    }
  }, []);

  const removeTab = useCallback(
    async (tabId: string, password?: string): Promise<boolean> => {
      try {
        await deleteTabApi(tabId, password);
        setTabs((prev) => prev.filter((t) => t.id !== tabId));
        setActiveTabId((prev) => {
          if (prev !== tabId) return prev;
          const remaining = tabs.filter((t) => t.id !== tabId);
          return remaining[0]?.id ?? null;
        });
        return true;
      } catch {
        return false;
      }
    },
    [tabs]
  );

  const value: TabsContextValue = {
    tabs,
    activeTabId,
    loading,
    error,
    loadTabs,
    selectTab,
    createTab,
    removeTab,
  };

  return (
    <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
  );
}

export function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within TabsProvider");
  }
  return context;
}
