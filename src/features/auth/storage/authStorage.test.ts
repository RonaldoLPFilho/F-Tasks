import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_STORAGE_KEYS,
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "./authStorage.ts";

const createMemoryStorage = () => {
  const data = new Map<string, string>();

  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
};

afterEach(() => {
  // @ts-expect-error test-only override
  globalThis.window = undefined;
});

test("saveAuthSession and readAuthSession keep token and username aligned", () => {
  // @ts-expect-error test-only override
  globalThis.window = { localStorage: createMemoryStorage() };

  saveAuthSession({ token: "jwt-token", username: "ronis" });

  assert.deepEqual(readAuthSession(), {
    token: "jwt-token",
    username: "ronis",
  });
});

test("clearAuthSession removes persisted auth data", () => {
  const localStorage = createMemoryStorage();
  // @ts-expect-error test-only override
  globalThis.window = { localStorage };

  saveAuthSession({ token: "jwt-token", username: "ronis" });
  clearAuthSession();

  assert.equal(localStorage.getItem(AUTH_STORAGE_KEYS.token), null);
  assert.equal(localStorage.getItem(AUTH_STORAGE_KEYS.username), null);
});
