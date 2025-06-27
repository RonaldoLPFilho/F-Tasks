import { useEffect, useState } from "react";
import { getDailySummary } from "../services/DailyService";
import { Clipboard, X } from "lucide-react";

interface Props {
    isOpen: boolean; 
    onClose: () => void;
    language?: string;
}

export function DailyModal({isOpen, onClose, language = "es-AR"}: Props){
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if(isOpen){
            setLoading(true);
            setSummary("");
            setError("");

            getDailySummary(language)
                .then((text) => {
                    setSummary(text);
                    setLoading(false);
                })
                .catch((err) => {
                    setError("Erro ao gerar resumo");
                    console.error(err)
                    setLoading(false);
                });
        }
    }, [isOpen, language])


    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary);
    }

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                    <X />
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Resumo da Daily</h2>

                {loading && (
                    <div className="text-center py-10 text-gray-500">
                        Gerando resumo da daily...
                        <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-opacity-50 mx-auto" />
                    </div>
                )}

                {!loading && error && (
                    <div className="text-red-600 text-sm text-center">{error}</div>
                )}

                {!loading && !error && (
                    <>
                        <textarea
                            value={summary}
                            readOnly
                            className="w-full h-60 border border-gray-300 rounded-lg p-4 text-sm resize-none"
                        />

                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                            >
                                <Clipboard size={16} />
                                Copiar
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                            >
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}