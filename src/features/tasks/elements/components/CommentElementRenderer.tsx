import { useEffect, useState } from "react";
import { CommentElement } from "../types/TaskElement";
import { ElementRendererProps } from "../types/TaskElement";
import { CalendarDays, ChevronDown, ChevronUp, MessageSquare, Send, Trash } from "lucide-react";
import { createCommentElement, deleteElement } from "../services/TaskElementService";
import { useCollapse } from "../../context/CollapseContext";
import { ConfirmModal } from "../../../../components/ConfirmModal";
import { useToast } from "../../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../../utils/extractApiErrorMessage";
import { splitHighlightedText } from "../../utils/highlightSearchText";

export function CommentElementRenderer({
    taskId,
    currentElements,
    onUpdate,
    readOnly = false,
    highlightTerms = [],
}: ElementRendererProps) {
    const comments = currentElements.filter((e): e is CommentElement => e.elementType === 'COMMENT');
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const { isExpanded } = useCollapse();
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded]);

    const handleCreateComment = async () => {
        if (readOnly) return;
        if (!newComment.trim()) return;
        try {
            setIsSubmitting(true);
            const created = await createCommentElement(taskId, newComment.trim());
            onUpdate([...currentElements, created]);
            setNewComment("");
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível adicionar o observação."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async () => {
        if (readOnly) return;
        if (!commentToDelete) return;
        try {
            await deleteElement(commentToDelete);
            onUpdate(currentElements.filter((e) => e.id !== commentToDelete));
            showSuccess("Comentário removido com sucesso.");
        } catch (err) {
            showError(extractApiErrorMessage(err, "Não foi possível remover o observação."));
        } finally {
            setCommentToDelete(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }) + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageSquare className="w-4 h-4"/>
                Observações
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen && (
                <div className="ml-6 mt-2 space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-100 rounded-xl p-3 text-sm text-gray-800">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold">{comment.author}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <CalendarDays className="w-4 h-4 shrink-0"/>
                                        {formatDate(comment.createdAt)}
                                    </div>
                                    <p className="mt-1">
                                        {splitHighlightedText(comment.description, highlightTerms).map((part, index) =>
                                            part.highlighted ? (
                                                <mark key={index} className="rounded bg-yellow-200 px-0.5 text-gray-900">{part.text}</mark>
                                            ) : (
                                                <span key={index}>{part.text}</span>
                                            )
                                        )}
                                    </p>
                                </div>
                                {!readOnly && (
                                    <button
                                        onClick={() => setCommentToDelete(comment.id)}
                                        aria-label="Excluir observação"
                                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                    >
                                        <Trash className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {!readOnly && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleCreateComment(); }}
                            className="flex items-center gap-2 pt-2"
                        >
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Adicionar uma observação..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-2 px-3"
                            >
                                <Send className="w-4 h-4"/>
                            </button>
                        </form>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={!readOnly && commentToDelete !== null}
                onConfirm={handleDeleteComment}
                onCancel={() => setCommentToDelete(null)}
            />
        </div>
    );
}
