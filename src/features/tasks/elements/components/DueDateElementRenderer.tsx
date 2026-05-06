import { useState } from "react";
import { CalendarDays, Check, Pencil, Trash, X } from "lucide-react";
import { DueDateElement } from "../types/TaskElement";
import { ElementRendererProps } from "../types/TaskElement";
import { createDueDateElement, deleteElement, updateDueDateElement } from "../services/TaskElementService";
import { useToast } from "../../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../../utils/extractApiErrorMessage";

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function isOverdue(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const due = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
}

function isDueSoon(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const due = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = due.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
}

export function DueDateElementRenderer({
    taskId,
    currentElements,
    onUpdate,
    onRemoveSection,
    readOnly = false,
}: ElementRendererProps) {
    const dueDate = currentElements.find((e): e is DueDateElement => e.elementType === "DUE_DATE");
    const [isEditing, setIsEditing] = useState(!dueDate);
    const [dateValue, setDateValue] = useState(dueDate?.dueDate ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const { showError } = useToast();

    const handleSave = async () => {
        if (!dateValue) return;
        setIsSaving(true);
        try {
            if (dueDate) {
                await updateDueDateElement(dueDate.id, dateValue);
                onUpdate(currentElements.map(e =>
                    e.id === dueDate.id ? { ...e, dueDate: dateValue } : e
                ));
            } else {
                const created = await createDueDateElement(taskId, dateValue);
                onUpdate([...currentElements, created]);
            }
            setIsEditing(false);
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível salvar a data de entrega."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!dueDate) {
            onRemoveSection?.();
            return;
        }
        try {
            await deleteElement(dueDate.id);
            onUpdate(currentElements.filter(e => e.id !== dueDate.id));
            onRemoveSection?.();
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível remover a data de entrega."));
        }
    };

    const handleCancel = () => {
        if (!dueDate) {
            onRemoveSection?.();
        } else {
            setDateValue(dueDate.dueDate);
            setIsEditing(false);
        }
    };

    const overdue = dueDate && isOverdue(dueDate.dueDate);
    const soon = dueDate && !overdue && isDueSoon(dueDate.dueDate);

    return (
        <div className="m-4 flex items-center gap-3">
            <CalendarDays className={`w-5 h-5 shrink-0 ${overdue ? "text-red-500" : soon ? "text-amber-500" : "text-gray-500"}`} />

            <span className="text-gray-600 font-medium text-sm shrink-0">Data entrega</span>

            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateValue}
                        onChange={e => setDateValue(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        disabled={!dateValue || isSaving}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-40"
                        aria-label="Confirmar data"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100"
                        aria-label="Cancelar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${overdue ? "text-red-600" : soon ? "text-amber-600" : "text-gray-800"}`}>
                        {dueDate && formatDate(dueDate.dueDate)}
                    </span>

                    {overdue && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            Atrasado
                        </span>
                    )}
                    {soon && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Em breve
                        </span>
                    )}

                    {!readOnly && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                aria-label="Editar data"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                                aria-label="Remover data de entrega"
                            >
                                <Trash className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
