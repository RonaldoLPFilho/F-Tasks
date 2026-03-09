import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { Category } from "../../../types/Category";

interface CategoryUpsertModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
}

export function CategoryUpsertModal({
  isOpen,
  category,
  onClose,
  onSubmit,
}: CategoryUpsertModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#9333EA");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(category?.name ?? "");
    setColor(category?.color ?? "#9333EA");
    setIsSubmitting(false);
  }, [category, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ name: name.trim(), color });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {category ? "Editar categoria" : "Nova categoria"}
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          {category
            ? "Atualize o nome e a cor da categoria."
            : "Crie uma nova categoria para organizar suas tasks."}
        </p>

        <div className="space-y-4">
          <FloatingLabelInput
            id="category_modal_name"
            label="Nome da categoria"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Cor</label>
            <HexColorPicker color={color} onChange={setColor} />
            <span className="text-sm text-gray-600">
              Cor selecionada: <span className="font-mono">{color}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {category ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}
