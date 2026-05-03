import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    Archive,
    Check,
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Task } from "../types/Task";
import { TaskSection } from "../types/TaskSection";
import { TaskSortableCard } from "./TaskSortableCard";

interface TaskSectionCardProps {
    section: TaskSection;
    isDefault: boolean;
    collapsed: boolean;
    onToggleCollapse: () => void;
    onRename: (sectionId: string, name: string) => Promise<string | null>;
    onArchive: (section: TaskSection) => void;
    onDelete: (section: TaskSection) => void;
    onToggleComplete: (task: Task) => void;
    onArchiveTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onUpdateTask: (updatedTask: Task) => void;
}

const formatTaskCount = (count: number) =>
    `${count} ${count === 1 ? "tarefa" : "tarefas"}`;

export function TaskSectionCard({
    section,
    isDefault,
    collapsed,
    onToggleCollapse,
    onRename,
    onArchive,
    onDelete,
    onToggleComplete,
    onArchiveTask,
    onDeleteTask,
    onUpdateTask,
}: TaskSectionCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(section.name);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setNodeRef, isOver } = useDroppable({
        id: section.id,
    });

    useEffect(() => {
        setName(section.name);
    }, [section.name]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Digite um nome para a section.");
            return;
        }

        setIsSaving(true);
        const result = await onRename(section.id, trimmedName);
        if (result) {
            setError(result);
            setIsSaving(false);
            return;
        }

        setError(null);
        setIsEditing(false);
        setIsSaving(false);
    };

    const taskIds = section.tasks.map((task) => task.id);

    return (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="flex min-w-0 items-center gap-2 text-left"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="truncate text-sm font-semibold text-gray-900">
                        {section.name}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({formatTaskCount(section.tasks.length)})
                    </span>
                </button>

                {isDefault ? null : isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setError(null);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void handleSave();
                                }
                                if (event.key === "Escape") {
                                    setIsEditing(false);
                                    setName(section.name);
                                    setError(null);
                                }
                            }}
                            className="w-40 rounded-lg border border-gray-300 px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={isSaving}
                            className="text-green-600 transition hover:text-green-700 disabled:opacity-50"
                            aria-label="Salvar nome da section"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setName(section.name);
                                setError(null);
                            }}
                            className="text-gray-500 transition hover:text-gray-700"
                            aria-label="Cancelar edição da section"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onArchive(section)}
                            aria-label={`Arquivar section ${section.name}`}
                            className="text-gray-500 transition hover:text-amber-600"
                        >
                            <Archive className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            aria-label={`Editar section ${section.name}`}
                            className="text-gray-500 transition hover:text-purple-600"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(section)}
                            aria-label={`Excluir section ${section.name}`}
                            className="text-gray-500 transition hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {error ? (
                <p className="px-4 pt-2 text-xs text-red-600">{error}</p>
            ) : null}

            {collapsed ? null : (
                <div
                    ref={setNodeRef}
                    className={`px-4 py-4 transition ${
                        isOver ? "rounded-b-2xl bg-purple-50/70" : ""
                    }`}
                >
                    <SortableContext
                        items={taskIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {section.tasks.length > 0 ? (
                            <div className="space-y-3">
                                {section.tasks.map((task) => (
                                    <TaskSortableCard
                                        key={task.id}
                                        task={task}
                                        onToggleComplete={() =>
                                            onToggleComplete(task)
                                        }
                                        onArchive={() => onArchiveTask(task)}
                                        onDelete={() => onDeleteTask(task.id)}
                                        onUpdateTask={onUpdateTask}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                Arraste tarefas para esta section.
                            </div>
                        )}
                    </SortableContext>
                </div>
            )}
        </section>
    );
}
