import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { StoredFile, StoredFilesPage } from "../types/StoredFile";

export const getStoredFiles = async ({
  name,
  uploadedFrom,
  uploadedTo,
  page = 0,
  size = 10,
}: {
  name?: string;
  uploadedFrom?: string;
  uploadedTo?: string;
  page?: number;
  size?: number;
}): Promise<StoredFilesPage> => {
  const response = await api.get<ApiResponse<StoredFilesPage>>("/files", {
    params: {
      page,
      size,
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(uploadedFrom ? { uploadedFrom } : {}),
      ...(uploadedTo ? { uploadedTo } : {}),
    },
  });

  return response.data.data;
};

export const uploadStoredFile = async (file: File): Promise<StoredFile> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiResponse<StoredFile>>("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const deleteStoredFile = async (fileId: string): Promise<void> => {
  await api.delete(`/files/${fileId}`);
};

export const downloadStoredFile = async (file: StoredFile): Promise<void> => {
  const response = await api.get<Blob>(`/files/${file.id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.originalFileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};
