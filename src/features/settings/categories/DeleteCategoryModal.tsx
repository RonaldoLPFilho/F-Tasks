import { useEffect, useMemo, useState } from "react";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";
import { Category } from "../../../types/Category";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onConfirm: (replacementCategoryId?: string) => Promise<void>;
}

export function DeleteCategoryModal({
  isOpen,
  category,
  categories,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  const [replacementCategoryId, setReplacementCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replacementOptions = useMemo(
    () =>
      categories
        .filter((item) => item.id !== category?.id)
        .map((item) => ({ label: item.name, value: item.id })),
    [categories, category]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setReplacementCategoryId(replacementOptions[0]?.value ?? "");
    setIsSubmitting(false);
  }, [isOpen, replacementOptions]);

  if (!isOpen || !category) {
    return null;
  }

  const requiresReplacement = category.defaultCategory;

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await onConfirm(requiresReplacement ? replacementCategoryId : undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Remover categoria</h3>
        <p className="mb-4 text-sm text-gray-600">
          {requiresReplacement
            ? "A categoria padrão só pode ser removida se você escolher outra categoria para assumir esse papel."
            : "As tasks vinculadas serão movidas para a categoria padrão do usuário."}
        </p>

        {requiresReplacement ? (
          replacementOptions.length > 0 ? (
            <FloatingLabelSelect
              id="replacement_category"
              label="Nova categoria padrão"
              value={replacementCategoryId}
              onChange={(event) => setReplacementCategoryId(event.target.value)}
              options={replacementOptions}
            />
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Crie outra categoria antes de remover a categoria padrão.
            </p>
          )
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || (requiresReplacement && !replacementCategoryId)}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
