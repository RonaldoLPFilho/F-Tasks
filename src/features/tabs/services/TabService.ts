import { Tab } from "../types/Tab";
import { ApiResponse } from "../../../types/ApiResponse";
import api from "../../../services/AxiosInterceptor";

export const getTabs = async (): Promise<Tab[]> => {
  const response = await api.get<ApiResponse<Tab[]>>("/tabs");
  return response.data.data;
};

export const getTabsAll = async (): Promise<Tab[]> => {
  const response = await api.get<ApiResponse<Tab[]>>("/tabs/all");
  return response.data.data;
};

export const getTabById = async (tabId: string): Promise<Tab> => {
  const response = await api.get<ApiResponse<Tab>>(`/tabs/${tabId}`);
  return response.data.data;
};

export const createTab = async (name: string): Promise<Tab> => {
  const response = await api.post<ApiResponse<Tab>>("/tabs", { name });
  return response.data.data;
};

export const updateTab = async (
  tabId: string,
  data: { name?: string; archived?: boolean }
): Promise<Tab> => {
  const response = await api.put<ApiResponse<Tab>>(`/tabs/${tabId}`, data);
  return response.data.data;
};

export const archiveTab = async (tabId: string): Promise<void> => {
  await api.patch(`/tabs/${tabId}/archive`);
};

export const unarchiveTab = async (tabId: string): Promise<void> => {
  await api.patch(`/tabs/${tabId}/unarchive`);
};

export const deleteTab = async (
  tabId: string,
  password?: string
): Promise<void> => {
  const body = password ? { password } : {};
  await api.delete(`/tabs/${tabId}`, { data: body });
};
