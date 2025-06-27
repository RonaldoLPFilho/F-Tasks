import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";

export async function getDailySummary(language: string): Promise<string>{
    const response = await api.get<ApiResponse<string>>("/daily/summary", {
        params: {language},
    });

    return response.data.data;
}