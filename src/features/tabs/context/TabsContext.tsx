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
  updateTab as updateTabApi,
  archiveTab as archiveTabApi,
  deleteTab as deleteTabApi,
} from "../services/TabService";
import { removeTabFromState, resolveActiveTabId } from "./tabState";

interface TabsContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  loading: boolean;
  error: string | null;
  loadTabs: () => Promise<void>;
  selectTab: (tabId: string) => void;
  createTab: (name: string) => Promise<Tab | null>;
  renameTab: (tabId: string, name: string) => Promise<Tab | null>;
  archiveTab: (tabId: string) => Promise<boolean>;
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
      setActiveTabId((prev) => resolveActiveTabId(prev, data));
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

  const renameTab = useCallback(async (tabId: string, name: string): Promise<Tab | null> => {
    try {
      const updatedTab = await updateTabApi(tabId, { name: name.trim() });
      setTabs((prev) =>
        prev.map((tab) => (tab.id === tabId ? { ...tab, ...updatedTab } : tab))
      );
      return updatedTab;
    } catch {
      return null;
    }
  }, []);

  const archiveTab = useCallback(
    async (tabId: string): Promise<boolean> => {
      try {
        await archiveTabApi(tabId);
        setTabs((prev) => {
          const nextState = removeTabFromState(prev, tabId, activeTabId);
          setActiveTabId(nextState.activeTabId);
          return nextState.tabs;
        });
        return true;
      } catch {
        return false;
      }
    },
    [activeTabId]
  );

  const removeTab = useCallback(
    async (tabId: string, password?: string): Promise<boolean> => {
      try {
        await deleteTabApi(tabId, password);
        setTabs((prev) => {
          const nextState = removeTabFromState(prev, tabId, activeTabId);
          setActiveTabId(nextState.activeTabId);
          return nextState.tabs;
        });
        return true;
      } catch {
        return false;
      }
    },
    [activeTabId]
  );

  const value: TabsContextValue = {
    tabs,
    activeTabId,
    loading,
    error,
    loadTabs,
    selectTab,
    createTab,
    renameTab,
    archiveTab,
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
