import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { TaskSection } from "../types/TaskSection";

export const getSections = async (tabId: string): Promise<TaskSection[]> => {
  const response = await api.get<ApiResponse<TaskSection[]>>(`/tabs/${tabId}/sections`);
  return response.data.data;
};

export const createSection = async (
  tabId: string,
  name: string
): Promise<TaskSection> => {
  const response = await api.post<ApiResponse<TaskSection>>(`/tabs/${tabId}/sections`, {
    name,
  });
  return response.data.data;
};

export const updateSection = async (
  tabId: string,
  sectionId: string,
  name: string
): Promise<TaskSection> => {
  const response = await api.put<ApiResponse<TaskSection>>(
    `/tabs/${tabId}/sections/${sectionId}`,
    { name }
  );
  return response.data.data;
};

export const deleteSection = async (
  tabId: string,
  sectionId: string
): Promise<void> => {
  await api.delete(`/tabs/${tabId}/sections/${sectionId}`);
};

export const archiveSection = async (
  tabId: string,
  sectionId: string
): Promise<void> => {
  await api.patch(`/tabs/${tabId}/sections/${sectionId}/archive`);
};

export const reorderSections = async (
  tabId: string,
  orderedIds: string[]
): Promise<void> => {
  await api.patch(`/tabs/${tabId}/sections/reorder`, { orderedIds });
};
