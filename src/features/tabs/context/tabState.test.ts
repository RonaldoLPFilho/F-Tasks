import test from "node:test";
import assert from "node:assert/strict";
import { removeTabFromState, resolveActiveTabId } from "./tabState.ts";
import type { Tab } from "../types/Tab";

const makeTab = (id: string): Tab => ({
  id,
  name: `Tab ${id}`,
  archived: false,
  sortOrder: Number(id),
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  sections: [],
});

test("resolveActiveTabId keeps current tab when it still exists", () => {
  const tabs = [makeTab("1"), makeTab("2")];

  assert.equal(resolveActiveTabId("2", tabs), "2");
});

test("resolveActiveTabId falls back to first tab when current tab disappeared", () => {
  const tabs = [makeTab("1"), makeTab("2")];

  assert.equal(resolveActiveTabId("3", tabs), "1");
});

test("removeTabFromState selects first remaining tab when active tab is removed", () => {
  const tabs = [makeTab("1"), makeTab("2"), makeTab("3")];

  const nextState = removeTabFromState(tabs, "2", "2");

  assert.deepEqual(nextState.tabs.map((tab) => tab.id), ["1", "3"]);
  assert.equal(nextState.activeTabId, "1");
});

test("removeTabFromState preserves active tab when another tab is removed", () => {
  const tabs = [makeTab("1"), makeTab("2"), makeTab("3")];

  const nextState = removeTabFromState(tabs, "1", "3");

  assert.deepEqual(nextState.tabs.map((tab) => tab.id), ["2", "3"]);
  assert.equal(nextState.activeTabId, "3");
});
