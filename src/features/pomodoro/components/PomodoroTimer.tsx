import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { BellRing, Pause, Play, RotateCw, Timer } from "lucide-react";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { useWidgetMedia } from "../../widget/context/WidgetMediaProvider";
import {
    acknowledgePomodoroAlarm,
    getPomodoroState,
    getUserPomodoroPreferences,
    pausePomodoro,
    resetPomodoro,
    resumePomodoro,
    startPomodoro,
} from "../services/PomodoroService";
import { PomodoroPreferences } from "../types/PomodoroPreferences";
import { PomodoroMode, PomodoroTimerState } from "../types/PomodoroTimerState";

interface PomodoroTimerProps {
    showUI?: boolean;
}

export function PomodoroTimer({ showUI = true }: PomodoroTimerProps) {
    const alarmsBaseUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/api\/?$/, "");

    const [preferences, setPreferences] = useState<PomodoroPreferences | null>(null);
    const [timerState, setTimerState] = useState<PomodoroTimerState | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [alarmPlaying, setAlarmPlaying] = useState(false);

    const intervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const syncingExpiredRef = useRef(false);
    const countdownDeadlineRef = useRef<number | null>(null);
    const { showError } = useToast();
    const { interruptRadioForAlarm, resumeRadioAfterAlarm, openPomodoroPanel } = useWidgetMedia();

    const getDisplaySeconds = (
        state: PomodoroTimerState,
        prefs: PomodoroPreferences
    ) => {
        const expectedSeconds =
            (state.mode === "BREAK" ? prefs.breakDuration : prefs.sessionDuration) * 60;

        if (state.status === "IDLE") {
            return expectedSeconds;
        }

        if (state.status === "PAUSED" && state.remainingSeconds > expectedSeconds) {
            return expectedSeconds;
        }

        if (state.status !== "RUNNING" && state.status !== "ALARM" && state.remainingSeconds <= 0) {
            return expectedSeconds;
        }

        if (state.status !== "RUNNING" && state.status !== "ALARM" && state.remainingSeconds > expectedSeconds * 60) {
            return expectedSeconds;
        }

        if (state.status !== "RUNNING" && state.status !== "ALARM" && state.remainingSeconds > expectedSeconds) {
            return (state.mode === "BREAK" ? prefs.breakDuration : prefs.sessionDuration) * 60;
        }

        return state.remainingSeconds;
    };

    const stopAlarm = () => {
        audioRef.current?.pause();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false;
        }
        setAlarmPlaying(false);
    };

    const syncPomodoro = async () => {
        const [prefs, state] = await Promise.all([
            getUserPomodoroPreferences(),
            getPomodoroState(),
        ]);

        setPreferences(prefs);
        setTimerState(state);
        setTimeLeft(getDisplaySeconds(state, prefs));
        countdownDeadlineRef.current =
            state.status === "RUNNING" ? Date.now() + state.remainingSeconds * 1000 : null;
        syncingExpiredRef.current = false;

        if (state.status !== "ALARM") {
            stopAlarm();
        }
    };

    useEffect(() => {
        syncPomodoro().catch((error) => {
            console.error("Erro ao carregar pomodoro", error);
            showError(extractApiErrorMessage(error, "Não foi possível carregar o pomodoro."));
        });

        const handlePreferencesUpdated = () => {
            syncPomodoro().catch((error) => {
                showError(extractApiErrorMessage(error, "Não foi possível sincronizar o pomodoro."));
            });
        };

        window.addEventListener("pomodoro-preferences-updated", handlePreferencesUpdated);

        return () => {
            window.removeEventListener("pomodoro-preferences-updated", handlePreferencesUpdated);
        };
    }, [showError]);

    useEffect(() => {
        if (timerState?.status !== "RUNNING") {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = window.setInterval(() => {
            const nextValue = countdownDeadlineRef.current
                ? Math.max(0, Math.ceil((countdownDeadlineRef.current - Date.now()) / 1000))
                : timerState.remainingSeconds;

            setTimeLeft(nextValue);

            if (nextValue === 0 && !syncingExpiredRef.current) {
                syncingExpiredRef.current = true;
                syncPomodoro().catch((error) => {
                    syncingExpiredRef.current = false;
                    showError(extractApiErrorMessage(error, "Não foi possível sincronizar o timer do pomodoro."));
                });
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState, showError]);

    useEffect(() => {
        if (timerState && preferences && timerState.status !== "RUNNING") {
            countdownDeadlineRef.current = null;
            setTimeLeft(getDisplaySeconds(timerState, preferences));
        }
    }, [preferences, timerState]);

    useEffect(() => {
        const playAlarm = async () => {
            const url = `${alarmsBaseUrl}/alarms/${preferences?.alarmSound}`;
            const audio = new Audio(url);
            audio.loop = true;
            audioRef.current = audio;
            openPomodoroPanel();
            interruptRadioForAlarm();

            try {
                await audio.play();
                setAlarmPlaying(true);
            } catch (error) {
                showError(extractApiErrorMessage(error, "Não foi possível tocar o alarme do pomodoro."));
            }
        };

        if (timerState?.status === "ALARM" && !alarmPlaying) {
            playAlarm();
        }

        if (timerState?.status !== "ALARM" && alarmPlaying) {
            stopAlarm();
        }
    }, [alarmPlaying, alarmsBaseUrl, preferences?.alarmSound, showError, timerState]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            stopAlarm();
        };
    }, []);

    if (!preferences || !timerState) return null;

    const formatTime = (seconds: number) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const currentMode: PomodoroMode = timerState.mode ?? "SESSION";
    const isRunning = timerState.status === "RUNNING";
    const isSession = currentMode === "SESSION";

    const handleToggleRunning = async () => {
        try {
            const data = isRunning
                ? await pausePomodoro()
                : timerState.status === "PAUSED"
                    ? await resumePomodoro()
                    : await startPomodoro(currentMode);

            setTimerState(data);
            countdownDeadlineRef.current =
                data.status === "RUNNING" ? Date.now() + data.remainingSeconds * 1000 : null;
            setTimeLeft(preferences ? getDisplaySeconds(data, preferences) : data.remainingSeconds);
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível atualizar o pomodoro."));
        }
    };

    const handleReset = async () => {
        try {
            const data = await resetPomodoro(currentMode);
            const shouldResumeRadio = alarmPlaying;
            stopAlarm();
            if (shouldResumeRadio) {
                await resumeRadioAfterAlarm();
            }
            setTimerState(data);
            countdownDeadlineRef.current = null;
            setTimeLeft(preferences ? getDisplaySeconds(data, preferences) : data.remainingSeconds);
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível reiniciar o pomodoro."));
        }
    };

    const handleAcknowledgeAlarm = async () => {
        const nextMode: PomodoroMode = timerState.mode === "SESSION" ? "BREAK" : "SESSION";

        try {
            const data = await acknowledgePomodoroAlarm(nextMode, true);
            stopAlarm();
            await resumeRadioAfterAlarm();
            setTimerState(data);
            countdownDeadlineRef.current =
                data.status === "RUNNING" ? Date.now() + data.remainingSeconds * 1000 : null;
            setTimeLeft(preferences ? getDisplaySeconds(data, preferences) : data.remainingSeconds);
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível confirmar o alarme do pomodoro."));
        }
    };

    if (!showUI) {
        return null;
    }

    return (
        <div className="space-y-2 text-center">
            <div className="mb-4 flex items-center justify-between font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                    <Timer size={30} /> {isSession ? "Sessão" : "Pausa"}
                </span>
            </div>

            <h2 className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</h2>

            <div className="mt-4 flex justify-between">
                {alarmPlaying ? (
                    <button
                        onClick={handleAcknowledgeAlarm}
                        className={clsx(
                            "w-full flex justify-center rounded-lg bg-purple-500 p-2 text-white-600 animate-bounce",
                            "transition-transform hover:scale-105"
                        )}
                    >
                        <BellRing size={30} />
                    </button>
                ) : (
                    <div className="flex w-full text-center">
                        <button
                            onClick={handleToggleRunning}
                            className="flex w-full items-center justify-center rounded-lg bg-purple-500 p-2 text-white transition hover:bg-purple-600"
                        >
                            {isRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                    </div>
                )}

                <button
                    onClick={handleReset}
                    className="ml-2 rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50"
                >
                    <RotateCw size={16} />
                </button>
            </div>
        </div>
    );
}