import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { PomodoroPreferences } from "../types/PomodoroPreferences";
import { PomodoroSoundOption } from "../types/PomodoroSoundOption";
import { PomodoroMode, PomodoroTimerState } from "../types/PomodoroTimerState";

export async function getUserPomodoroPreferences() : Promise<PomodoroPreferences>{
    const response = await api.get<ApiResponse<PomodoroPreferences>>(`/pomodoro`)
    return response.data.data;
}

export async function updateUserPomodoroPreferences(data: {
    sessionDuration: number;
    breakDuration: number;
    alarmSound: string;
}): Promise<PomodoroPreferences> {
    const response = await api.put<ApiResponse<PomodoroPreferences>>(`/pomodoro`, data);
    return response.data.data;
}

export async function getPomodoroSounds(): Promise<PomodoroSoundOption[]> {
    const response = await api.get<ApiResponse<PomodoroSoundOption[]>>(`/pomodoro/sounds`);
    return response.data.data;
}

export async function getPomodoroState(): Promise<PomodoroTimerState> {
    const response = await api.get<ApiResponse<PomodoroTimerState>>(`/pomodoro/state`);
    return response.data.data;
}

export async function startPomodoro(mode: PomodoroMode): Promise<PomodoroTimerState> {
    const response = await api.post<ApiResponse<PomodoroTimerState>>(`/pomodoro/state/start`, { mode });
    return response.data.data;
}

export async function pausePomodoro(): Promise<PomodoroTimerState> {
    const response = await api.post<ApiResponse<PomodoroTimerState>>(`/pomodoro/state/pause`);
    return response.data.data;
}

export async function resumePomodoro(): Promise<PomodoroTimerState> {
    const response = await api.post<ApiResponse<PomodoroTimerState>>(`/pomodoro/state/resume`);
    return response.data.data;
}

export async function resetPomodoro(mode: PomodoroMode): Promise<PomodoroTimerState> {
    const response = await api.post<ApiResponse<PomodoroTimerState>>(`/pomodoro/state/reset`, { mode });
    return response.data.data;
}

export async function acknowledgePomodoroAlarm(nextMode: PomodoroMode, autoStart: boolean): Promise<PomodoroTimerState> {
    const response = await api.post<ApiResponse<PomodoroTimerState>>(`/pomodoro/state/acknowledge`, {
        nextMode,
        autoStart,
    });
    return response.data.data;
}