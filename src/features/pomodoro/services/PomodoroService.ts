import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { PomodoroPreferences } from "../types/PomodoroPreferences";

export async function getUserPomodoroPreferences() : Promise<PomodoroPreferences>{
    const response = await api.get<ApiResponse<PomodoroPreferences>>(`/pomodoro`)
    return response.data.data;
}