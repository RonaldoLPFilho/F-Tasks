import { useState } from "react";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";
import { LanguageOptions } from "./LanguageOptions";

export function LanguageSettings() {

    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOptions>();

    const getLanguageOptions = () => {
        return Object.entries(LanguageOptions).map(([key, value]) => ({
            value: key,
            label: value
        }))
    }

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement> ) => {
        setSelectedLanguage(e.target.value as LanguageOptions);
    }

    return (
        <div className="flex flex-col gap-4 rounded-lg p-4">
            <p className="text-2xl">Seleção de idioma</p>
            <p className="text-sm text-gray-500">Escolha o idioma em que a IA irá gerar o resumo da Daily</p>

        <FloatingLabelSelect
            id="language_select"
            label="Idioma"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={getLanguageOptions()}
        />
        </div>
    )
}