import { FormEvent, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

interface TaskCreateSectionInlineProps {
  currentCount: number;
  maxSections: number;
  onCreate: (name: string) => Promise<string | null>;
}

export function TaskCreateSectionInline({
  currentCount,
  maxSections,
  onCreate,
}: TaskCreateSectionInlineProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = currentCount >= maxSections;

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const resetForm = () => {
    setIsCreating(false);
    setName("");
    setError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Digite um nome para a section.");
      return;
    }

    setIsSubmitting(true);
    const result = await onCreate(trimmedName);
    if (result) {
      setError(result);
      setIsSubmitting(false);
      return;
    }

    resetForm();
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {isCreating ? (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-3 py-2 shadow-sm"
        >
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                resetForm();
              }
            }}
            placeholder="Nome da section"
            className="w-44 bg-transparent text-sm outline-none"
            maxLength={30}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            Criar
          </button>
          <button
            type="button"
            onClick={resetForm}
            aria-label="Cancelar criação de section"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled={isLimitReached}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Nova Section ({currentCount}/{maxSections})
        </button>
      )}

      {isLimitReached && !isCreating ? (
        <p className="text-xs text-red-600">
          Limite de {maxSections} sections por aba atingido.
        </p>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
