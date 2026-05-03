import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { VaultItem, VaultItemPayload, VaultUnlockResponse } from "../types/VaultItem";

const vaultHeaders = (token: string) => ({
  "X-Vault-Token": token,
});

export const unlockVault = async (password: string): Promise<VaultUnlockResponse> => {
  const response = await api.post<ApiResponse<VaultUnlockResponse>>("/vault/unlock", {
    password,
  });

  return response.data.data;
};

export const getVaultItems = async (token: string): Promise<VaultItem[]> => {
  const response = await api.get<ApiResponse<VaultItem[]>>("/vault/items", {
    headers: vaultHeaders(token),
  });

  return response.data.data;
};

export const createVaultItem = async (
  token: string,
  payload: VaultItemPayload,
): Promise<VaultItem> => {
  const response = await api.post<ApiResponse<VaultItem>>("/vault/items", payload, {
    headers: vaultHeaders(token),
  });

  return response.data.data;
};

export const updateVaultItem = async (
  token: string,
  itemId: string,
  payload: VaultItemPayload,
): Promise<VaultItem> => {
  const response = await api.put<ApiResponse<VaultItem>>(`/vault/items/${itemId}`, payload, {
    headers: vaultHeaders(token),
  });

  return response.data.data;
};

export const deleteVaultItem = async (token: string, itemId: string): Promise<void> => {
  await api.delete(`/vault/items/${itemId}`, {
    headers: vaultHeaders(token),
  });
};
