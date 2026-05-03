import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { HowToDoDetail, HowToDoPage, HowToDoPayload } from "../types/HowToDoDocument";

export const getHowToDoDocuments = async ({
  title,
  page = 0,
  size = 10,
}: {
  title?: string;
  page?: number;
  size?: number;
}): Promise<HowToDoPage> => {
  const response = await api.get<ApiResponse<HowToDoPage>>("/how-to-do", {
    params: {
      page,
      size,
      ...(title?.trim() ? { title: title.trim() } : {}),
    },
  });

  return response.data.data;
};

export const getHowToDoDocument = async (id: string): Promise<HowToDoDetail> => {
  const response = await api.get<ApiResponse<HowToDoDetail>>(`/how-to-do/${id}`);
  return response.data.data;
};

export const createHowToDoDocument = async (payload: HowToDoPayload): Promise<HowToDoDetail> => {
  const response = await api.post<ApiResponse<HowToDoDetail>>("/how-to-do", payload);
  return response.data.data;
};

export const updateHowToDoDocument = async (id: string, payload: HowToDoPayload): Promise<HowToDoDetail> => {
  const response = await api.put<ApiResponse<HowToDoDetail>>(`/how-to-do/${id}`, payload);
  return response.data.data;
};

export const deleteHowToDoDocument = async (id: string): Promise<void> => {
  await api.delete(`/how-to-do/${id}`);
};
