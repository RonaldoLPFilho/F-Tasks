import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";

export function PomodoroSettings() {

    const teste = [
        {label: "Sino", value: "v1"},
        {label: "Ai paiii para", value: "v1"},
        {label: "Trombetão", value: "v1"}
    ]
    return (
        <div className="flex flex-col gap-4 rounded-lg p-4">
            <p className="text-2xl">Preferências do Pomodoro</p>
            <p className="text-sm text-gray-500">Escolha o idioma em que a IA irá gerar o resumo da Daily</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="session_time"
                        label="Tempo da Sessão"
                        required
                    />
                </div>

                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="break_time"
                        label="Tempo da Pausa"
                        required
                    />
                </div>
            </div>

            <FloatingLabelSelect
                id="alarm_sound_select"
                label="Som do Alarme"
                value={teste[1].label}
                options={teste}            
            />
        </div>
    )
}