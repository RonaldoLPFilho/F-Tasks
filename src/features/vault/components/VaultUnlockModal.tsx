import { FormEvent, useState } from "react";
import { LockKeyhole, X } from "lucide-react";

interface VaultUnlockModalProps {
  isOpen: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export function VaultUnlockModal({ isOpen, onUnlock, onCancel }: VaultUnlockModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Digite a senha do cofre.");
      return;
    }

    setLoading(true);
    try {
      const unlocked = await onUnlock(password);
      if (!unlocked) {
        setError("Não foi possível desbloquear o cofre.");
        return;
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Desbloquear cofre</h3>
            <p className="text-sm text-gray-600">Digite a senha para acessar os dados salvos.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              placeholder="Digite sua senha"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Desbloqueando..." : "Desbloquear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
