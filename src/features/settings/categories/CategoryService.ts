import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { Category } from "../../../types/Category";

export async function getAllCategories(): Promise<Category[]>{
    const response = await api.get<ApiResponse<Category[]>>(`/categories`);
    return response.data.data;
}

export const createCategory = async (data: {name: string; color: string}): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>(`/categories`, data);
    return response.data.data;
}

export const updateCategory = async (
    id: string,
    data: {name: string; color: string}
): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
}

export const deleteCategory = async (
    id: string,
    replacementCategoryId?: string
): Promise<void> => {
    await api.delete(`/categories/${id}`, {
        data: replacementCategoryId ? { replacementCategoryId } : undefined,
    });
}
