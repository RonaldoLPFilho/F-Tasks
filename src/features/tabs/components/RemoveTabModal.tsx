import { useState } from "react";
import { X } from "lucide-react";

interface RemoveTabModalProps {
  tabName: string;
  hasTasks: boolean;
  onConfirm: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export function RemoveTabModal({
  tabName,
  hasTasks,
  onConfirm,
  onCancel,
}: RemoveTabModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasTasks && !password.trim()) {
      setError("Digite sua senha para confirmar.");
      return;
    }

    setLoading(true);
    try {
      const success = await onConfirm(hasTasks ? password : "");
      if (!success) {
        setError("Senha incorreta.");
      } else {
        onCancel();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 relative">
        <button
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Remover aba &apos;{tabName}&apos;
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Ao remover esta aba, todas as tarefas associadas serão apagadas
          permanentemente. Digite sua senha para confirmar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {hasTasks && (
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Digite sua senha"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              Remover Aba
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
