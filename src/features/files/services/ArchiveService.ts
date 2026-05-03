import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { ArchivedItemsPage } from "../types/ArchivedItem";

export const getArchivedItems = async ({
  query,
  page = 0,
  size = 10,
}: {
  query?: string;
  page?: number;
  size?: number;
}): Promise<ArchivedItemsPage> => {
  const trimmedQuery = query?.trim() ?? "";
  const response = await api.get<ApiResponse<ArchivedItemsPage>>("/archive/search", {
    params: {
      page,
      size,
      ...(trimmedQuery.length >= 2 ? { q: trimmedQuery } : {}),
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
