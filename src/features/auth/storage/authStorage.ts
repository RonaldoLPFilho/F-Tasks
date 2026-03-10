export interface AuthSession {
  token: string;
  username: string;
}

export const AUTH_STORAGE_KEYS = {
  token: "token",
  username: "username",
} as const;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export function readAuthSession(): AuthSession {
  const storage = getStorage();

  return {
    token: storage?.getItem(AUTH_STORAGE_KEYS.token) ?? "",
    username: storage?.getItem(AUTH_STORAGE_KEYS.username) ?? "",
  };
}

export function saveAuthSession(session: AuthSession) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEYS.token, session.token);
  storage.setItem(AUTH_STORAGE_KEYS.username, session.username);
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEYS.token);
  storage.removeItem(AUTH_STORAGE_KEYS.username);
}
