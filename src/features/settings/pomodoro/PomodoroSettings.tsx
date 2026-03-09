import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";
import { useEffect, useMemo, useState } from "react";
import {
    getPomodoroSounds,
    getUserPomodoroPreferences,
    updateUserPomodoroPreferences,
} from "../../pomodoro/services/PomodoroService";
import { PomodoroSoundOption } from "../../pomodoro/types/PomodoroSoundOption";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

export function PomodoroSettings() {
    const [sessionDuration, setSessionDuration] = useState("30");
    const [breakDuration, setBreakDuration] = useState("5");
    const [alarmSound, setAlarmSound] = useState("");
    const [sounds, setSounds] = useState<PomodoroSoundOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        const loadPomodoroSettings = async () => {
            try {
                const [preferences, soundOptions] = await Promise.all([
                    getUserPomodoroPreferences(),
                    getPomodoroSounds(),
                ]);

                setSessionDuration(String(preferences.sessionDuration));
                setBreakDuration(String(preferences.breakDuration));
                setAlarmSound(preferences.alarmSound);
                setSounds(soundOptions);
            } catch (error) {
                showError(extractApiErrorMessage(error, "Não foi possível carregar as preferências do pomodoro."));
            }
        };

        loadPomodoroSettings();
    }, [showError]);

    const soundOptions = useMemo(
        () => sounds.map((sound) => ({ label: sound.name, value: sound.file })),
        [sounds]
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            await updateUserPomodoroPreferences({
                sessionDuration: Number(sessionDuration),
                breakDuration: Number(breakDuration),
                alarmSound,
            });

            window.dispatchEvent(new Event("pomodoro-preferences-updated"));
            showSuccess("Preferências do pomodoro atualizadas com sucesso.");
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível atualizar as preferências do pomodoro."));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form className="flex flex-col gap-4 rounded-lg p-4" onSubmit={handleSubmit}>
            <p className="text-2xl">Preferências do Pomodoro</p>
            <p className="text-sm text-gray-500">Configure os tempos do ciclo e o som usado no alarme.</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="session_time"
                        label="Tempo da Sessão (em minutos)"
                        type="number"
                        required
                        min={1}
                        value={sessionDuration}
                        onChange={(event) => setSessionDuration(event.target.value)}
                    />
                </div>

                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="break_time"
                        label="Tempo da Pausa (em minutos)"
                        type="number"
                        required
                        min={1}
                        value={breakDuration}
                        onChange={(event) => setBreakDuration(event.target.value)}
                    />
                </div>
            </div>

            <FloatingLabelSelect
                id="alarm_sound_select"
                label="Som do Alarme"
                value={alarmSound}
                onChange={(event) => setAlarmSound(event.target.value)}
                options={soundOptions}
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving || !alarmSound}
                    className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Salvar
                </button>
            </div>
        </form>
    )
}