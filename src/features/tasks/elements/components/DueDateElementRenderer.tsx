import { useState } from "react";
import { CalendarDays, Check, Clock, Pencil, Trash, X } from "lucide-react";
import { DueDateElement, ElementRendererProps } from "../types/TaskElement";
import { createDueDateElement, deleteElement, updateDueDateElement } from "../services/TaskElementService";
import { useToast } from "../../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../../utils/extractApiErrorMessage";

function formatDateTime(dueDate: string, dueTime?: string | null) {
    const [year, month, day] = dueDate.split("-").map(Number);
    const datePart = new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
    if (!dueTime) return datePart;
    const [h, m] = dueTime.split(":");
    return `${datePart} às ${h}:${m}`;
}

function isOverdue(dueDate: string, dueTime?: string | null) {
    const [year, month, day] = dueDate.split("-").map(Number);
    if (dueTime) {
        const [h, m] = dueTime.split(":").map(Number);
        return new Date(year, month - 1, day, h, m) < new Date();
    }
    const due = new Date(year, month - 1, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return due < today;
}

function isDueSoon(dueDate: string, dueTime?: string | null) {
    const [year, month, day] = dueDate.split("-").map(Number);
    const due = dueTime
        ? (() => { const [h, m] = dueTime.split(":").map(Number); return new Date(year, month - 1, day, h, m); })()
        : new Date(year, month - 1, day);
    const diffMs = due.getTime() - Date.now();
    return diffMs >= 0 && diffMs <= 3 * 24 * 60 * 60 * 1000;
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
    const [timeValue, setTimeValue] = useState(dueDate?.dueTime ? dueDate.dueTime.slice(0, 5) : "");
    const [isSaving, setIsSaving] = useState(false);
    const { showError } = useToast();

    const handleSave = async () => {
        if (!dateValue) return;
        setIsSaving(true);
        try {
            const time = timeValue || undefined;
            if (dueDate) {
                await updateDueDateElement(dueDate.id, dateValue, time);
                onUpdate(currentElements.map(e =>
                    e.id === dueDate.id ? { ...e, dueDate: dateValue, dueTime: time ?? null } : e
                ));
            } else {
                const created = await createDueDateElement(taskId, dateValue, time);
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
        if (!dueDate) { onRemoveSection?.(); return; }
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
            setTimeValue(dueDate.dueTime ? dueDate.dueTime.slice(0, 5) : "");
            setIsEditing(false);
        }
    };

    const overdue = dueDate && isOverdue(dueDate.dueDate, dueDate.dueTime);
    const soon = dueDate && !overdue && isDueSoon(dueDate.dueDate, dueDate.dueTime);

    return (
        <div className="m-4 flex items-center gap-3 flex-wrap">
            <CalendarDays className={`w-5 h-5 shrink-0 ${overdue ? "text-red-500" : soon ? "text-amber-500" : "text-gray-500"}`} />
            <span className="text-gray-600 font-medium text-sm shrink-0">Data entrega</span>

            {isEditing ? (
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="date"
                        value={dateValue}
                        onChange={e => setDateValue(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                    />
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <input
                            type="time"
                            value={timeValue}
                            onChange={e => setTimeValue(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-400 text-xs ml-1">opcional</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!dateValue || isSaving}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-40"
                        aria-label="Confirmar"
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
                        {dueDate && formatDateTime(dueDate.dueDate, dueDate.dueTime)}
                    </span>

                    {overdue && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Atrasado</span>
                    )}
                    {soon && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Em breve</span>
                    )}

                    {!readOnly && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                aria-label="Editar"
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
