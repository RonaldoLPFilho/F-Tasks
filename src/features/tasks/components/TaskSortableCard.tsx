import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { Task } from "../types/Task";
import { TaskCard } from "./TaskCard";

interface TaskCardActions {
  onToggleComplete: () => void;
  onArchive?: () => void;
  onDelete: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

interface TaskSortableCardProps extends TaskCardActions {
  task: Task;
}

function TaskCardShell({
  task,
  listeners,
  attributes,
  setActivatorNodeRef,
  isDragging,
  onToggleComplete,
  onArchive,
  onDelete,
  onUpdateTask,
}: TaskSortableCardProps & {
  listeners?: ReturnType<typeof useSortable>["listeners"];
  attributes?: ReturnType<typeof useSortable>["attributes"];
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  isDragging?: boolean;
}) {
  return (
    <div className={`flex items-start gap-2 ${isDragging ? "opacity-40" : ""}`}>
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label="Reordenar task"
        title="Arraste para reordenar"
        className="mt-4 cursor-grab rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <TaskCard
          task={task}
          onToggleComplete={onToggleComplete}
          onArchive={onArchive}
          onDelete={onDelete}
          onUpdateTask={onUpdateTask}
        />
      </div>
    </div>
  );
}

export function TaskSortableCard({
  task,
  onToggleComplete,
  onArchive,
  onDelete,
  onUpdateTask,
}: TaskSortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="touch-none"
    >
      <TaskCardShell
        task={task}
        listeners={listeners}
        attributes={attributes}
        setActivatorNodeRef={setActivatorNodeRef}
        isDragging={isDragging}
        onToggleComplete={onToggleComplete}
        onArchive={onArchive}
        onDelete={onDelete}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
}

export function TaskDragPreview({
  task,
  onToggleComplete,
  onArchive,
  onDelete,
  onUpdateTask,
}: TaskSortableCardProps) {
  return (
    <div className="w-[min(42rem,calc(100vw-3rem))] rounded-2xl bg-white/80">
      <TaskCardShell
        task={task}
        onToggleComplete={onToggleComplete}
        onArchive={onArchive}
        onDelete={onDelete}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
}
