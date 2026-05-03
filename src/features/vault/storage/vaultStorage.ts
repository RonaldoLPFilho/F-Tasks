export interface VaultSession {
  token: string;
  expiresAt?: string;
}

const VAULT_STORAGE_KEYS = {
  token: "vaultToken",
  expiresAt: "vaultExpiresAt",
} as const;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

export function readVaultSession(): VaultSession | null {
  const storage = getStorage();
  const token = storage?.getItem(VAULT_STORAGE_KEYS.token);
  if (!storage || !token) {
    return null;
  }

  const expiresAt = storage.getItem(VAULT_STORAGE_KEYS.expiresAt) ?? undefined;
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    clearVaultSession();
    return null;
  }

  return { token, expiresAt };
}

export function saveVaultSession(session: VaultSession) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(VAULT_STORAGE_KEYS.token, session.token);
  if (session.expiresAt) {
    storage.setItem(VAULT_STORAGE_KEYS.expiresAt, session.expiresAt);
  } else {
    storage.removeItem(VAULT_STORAGE_KEYS.expiresAt);
  }
}

export function clearVaultSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(VAULT_STORAGE_KEYS.token);
  storage.removeItem(VAULT_STORAGE_KEYS.expiresAt);
}
