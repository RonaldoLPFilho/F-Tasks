import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { ArchivedSearchResult } from "../types/ArchivedItem";

export const searchArchivedItems = async (
  query: string,
  limit = 30
): Promise<ArchivedSearchResult[]> => {
  const response = await api.get<ApiResponse<ArchivedSearchResult[]>>("/archive/search", {
    params: {
      q: query,
      limit,
    },
  });

  return response.data.data;
};

export const restoreArchivedTab = async (tabId: string): Promise<void> => {
  await api.post(`/archive/tabs/${tabId}/restore`);
};

export const restoreArchivedSection = async (
  sectionId: string,
  data?: {
    restoreParents?: boolean;
    targetTabId?: string;
  }
): Promise<void> => {
  await api.post(`/archive/sections/${sectionId}/restore`, data ?? {});
};

export const restoreArchivedTask = async (
  taskId: string,
  data?: {
    restoreParents?: boolean;
    targetTabId?: string;
    targetSectionId?: string;
  }
): Promise<void> => {
  await api.post(`/archive/tasks/${taskId}/restore`, data ?? {});
};
