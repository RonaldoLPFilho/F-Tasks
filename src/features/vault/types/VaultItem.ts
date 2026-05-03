export interface VaultEntry {
  key: string;
  value: string;
}

export interface VaultItem {
  id: string;
  name: string;
  description?: string;
  entries: VaultEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultUnlockResponse {
  token: string;
  expiresAt?: string;
}

export interface VaultItemPayload {
  name: string;
  description?: string;
  entries: VaultEntry[];
}
