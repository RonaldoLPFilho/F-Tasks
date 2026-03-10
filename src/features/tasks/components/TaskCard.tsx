import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle,
  Circle,
  Pencil,
  Trash,
  X,
} from "lucide-react";
import { Divider } from "../../../components/Divider";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { TaskSubtasks } from "../subtasks/components/TaskSubtasks";
import { TaskComments } from "../comments/components/TaskComment";
import { Task } from "../types/Task";
import { updateTask } from "../services/TaskService";
import { splitHighlightedText } from "../utils/highlightSearchText";

interface TaskCardProps {
  task: Task;
  onToggleComplete: () => void;
  onDelete: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  readOnly?: boolean;
  highlightTerms?: string[];
}

export function TaskCard({
  task,
  onToggleComplete,
  onDelete,
  onUpdateTask,
  readOnly = false,
  highlightTerms = [],
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }, [task.id, task.title, task.description]);

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        completed: task.completed,
        jiraId: task.jiraId ?? undefined,
        categoryId: task.category?.id ?? undefined,
      });
      onUpdateTask({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
      showSuccess("Task atualizada com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar a tarefa", err);
      showError(extractApiErrorMessage(err, "Não foi possível atualizar a task."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setIsEditing(false);
  };

  const borderColor = isEditing
    ? "rgb(34 197 94)"
    : task.category?.color ?? "#9333ea";

  return (
    <div
      className="w-full border-l-4 rounded-xl shadow-sm p-6 bg-white"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={onToggleComplete}
            className={`text-gray-600 shrink-0 ${readOnly ? "cursor-default" : "hover:text-black"}`}
            disabled={isEditing || readOnly}
          >
            {task.completed ? (
              <CheckCircle size={20} className="text-violet-600" />
            ) : (
              <Circle size={20} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                  className="w-full text-xl font-semibold border border-gray-200 rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descrição"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editTitle.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Check className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3
                  className={`text-xl font-semibold ${
                    task.completed ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {splitHighlightedText(task.title, highlightTerms).map((part, index) =>
                    part.highlighted ? (
                      <mark key={index} className="rounded bg-yellow-200 px-0.5 text-gray-900">
                        {part.text}
                      </mark>
                    ) : (
                      <span key={index}>{part.text}</span>
                    )
                  )}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                  </div>

                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.subtasks?.length || 0} subtarefas
                  </div>

                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.comments?.length || 0} comentário(s)
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-6 mb-6">
                  {task.description ? (
                    splitHighlightedText(task.description, highlightTerms).map((part, index) =>
                      part.highlighted ? (
                        <mark key={index} className="rounded bg-yellow-200 px-0.5 text-gray-900">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={index}>{part.text}</span>
                      )
                    )
                  ) : (
                    <span className="text-gray-400 italic">Sem descrição</span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        {!isEditing && !readOnly && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleStartEdit}
              aria-label="Editar"
              className="text-gray-500 hover:text-purple-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Excluir"
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isEditing && (
        <>
          <TaskSubtasks
            taskId={task.id}
            subtasks={task.subtasks}
            readOnly={readOnly}
            highlightTerms={highlightTerms}
            onSubtasksUpdated={(newSubs) => {
              onUpdateTask({ ...task, subtasks: newSubs });
            }}
          />
          <Divider />
          <TaskComments
            taskId={task.id}
            comments={task.comments}
            readOnly={readOnly}
            highlightTerms={highlightTerms}
            onCommentsUpdated={(newComments) => {
              onUpdateTask({ ...task, comments: newComments });
            }}
          />
        </>
      )}
    </div>
  );
}
