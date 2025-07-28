import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { Category } from "../../../types/Category";

export async function getAllCategories(): Promise<Category[]>{
    const response = await api.get<ApiResponse<Category[]>>(`/categories`);
    return response.data.data;
}

export const createCategory = async (data: {name: string; color: string}): Promise<void> => {
    await api.post(`/categories`, data);
}
