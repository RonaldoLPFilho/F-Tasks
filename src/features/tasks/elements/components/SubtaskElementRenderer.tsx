import { CheckCircle, ChevronDown, ChevronUp, Plus, Trash } from "lucide-react";
import { SubtaskElement } from "../types/TaskElement";
import { ElementRendererProps } from "../types/TaskElement";
import { useEffect, useState } from "react";
import { createSubtaskElement, deleteElement, toggleSubtaskCompletion } from "../services/TaskElementService";
import { useCollapse } from "../../context/CollapseContext";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import { useToast } from "../../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../../utils/extractApiErrorMessage";
import { splitHighlightedText } from "../../utils/highlightSearchText";

export function SubtaskElementRenderer({
    taskId,
    currentElements,
    onUpdate,
    readOnly = false,
    highlightTerms = [],
}: ElementRendererProps) {
    const subtasks = currentElements.filter((e): e is SubtaskElement => e.elementType === 'SUBTASK');
    const [isOpen, setIsOpen] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.completed).length;
    const [isSubmitting, setSubmitting] = useState(false);
    const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);
    const { isExpanded } = useCollapse();
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    const handleAddSubtask = async () => {
        if (readOnly) return;
        if (!newSubtask.trim()) return;
        try {
            setSubmitting(true);
            const created = await createSubtaskElement(taskId, newSubtask.trim());
            onUpdate([...currentElements, created]);
            setNewSubtask("");
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível criar a item do checklist."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompletion = async (id: string, isCompleted: boolean) => {
        if (readOnly) return;
        try {
            await toggleSubtaskCompletion(id, isCompleted);
            onUpdate(currentElements.map((e) => e.id === id ? { ...e, completed: isCompleted } : e));
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível atualizar a item do checklist."));
        }
    };

    const handleDeleteSubtask = async () => {
        if (readOnly) return;
        if (!subtaskToDelete) return;
        try {
            await deleteElement(subtaskToDelete);
            onUpdate(currentElements.filter((e) => e.id !== subtaskToDelete));
            showSuccess("Subtarefa removida com sucesso.");
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível remover a item do checklist."));
        } finally {
            setSubtaskToDelete(null);
        }
    };

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CheckCircle className="w-5 h-5"/>
                Checklist
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {completed}/{total}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen && (
                <div className="ml-6 space-y-2">
                    {subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 text-sm mt-4">
                            <div
                                className={`flex items-center gap-2 flex-1 min-w-0 ${readOnly ? "" : "cursor-pointer"}`}
                                onClick={() => !readOnly && handleCompletion(sub.id, !sub.completed)}
                            >
                                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-500 shrink-0">
                                    {sub.completed && <CheckCircle className="h-4 w-4 text-purple-600"/>}
                                </div>
                                <span className={sub.completed ? "line-through text-gray-800" : "text-gray-800"}>
                                    {splitHighlightedText(sub.title, highlightTerms).map((part, index) =>
                                        part.highlighted ? (
                                            <mark key={index} className="rounded bg-yellow-200 px-0.5 text-gray-900">{part.text}</mark>
                                        ) : (
                                            <span key={index}>{part.text}</span>
                                        )
                                    )}
                                </span>
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSubtaskToDelete(sub.id); }}
                                    aria-label={`Excluir item do checklist ${sub.title}`}
                                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                >
                                    <Trash className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    ))}

                    {!readOnly && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleAddSubtask(); }}
                            className="flex items-center gap-2 mt-4"
                        >
                            <input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Novo item..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg px-3"
                                disabled={!newSubtask.trim() || isSubmitting}
                            >
                                <Plus className="w-4 h-4"/>
                            </button>
                        </form>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!readOnly && subtaskToDelete !== null}
                onConfirm={handleDeleteSubtask}
                onCancel={() => setSubtaskToDelete(null)}
            />
        </div>
    );
}
