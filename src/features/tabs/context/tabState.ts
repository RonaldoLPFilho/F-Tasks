import type { Tab } from "../types/Tab";

export function resolveActiveTabId(currentActiveTabId: string | null, tabs: Tab[]) {
  if (currentActiveTabId && tabs.some((tab) => tab.id === currentActiveTabId)) {
    return currentActiveTabId;
  }

  return tabs[0]?.id ?? null;
}

export function removeTabFromState(
  tabs: Tab[],
  removedTabId: string,
  currentActiveTabId: string | null
) {
  const remainingTabs = tabs.filter((tab) => tab.id !== removedTabId);

  return {
    tabs: remainingTabs,
    activeTabId:
      currentActiveTabId === removedTabId
        ? remainingTabs[0]?.id ?? null
        : resolveActiveTabId(currentActiveTabId, remainingTabs),
  };
}
