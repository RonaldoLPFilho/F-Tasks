import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { Task } from "../types/Task";
import { TaskCard } from "./TaskCard";
import { useCallback } from "react";

type Props = {
  task: Task;
  onDragEnd?: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateTask: (updatedTask: Task) => void;
};

export function TaskDraggableCard({
  task,
  onDragEnd,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateTask,
}: Props) {
  const controls = useDragControls();

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      controls.start(e);
    },
    [controls]
  );

  return (
    <Reorder.Item
      value={task}
      drag="y"
      dragControls={controls}
      dragListener={false} 
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.01 }}
      className="select-none"
    >
      <div className="flex items-start gap-1">
        {/* handle */}
        <button
          onPointerDown={startDrag}
          aria-label="Reordenar"
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600"
          title="Arraste para reordenar"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <TaskCard
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateTask={onUpdateTask}
          />
        </div>
      </div>
    </Reorder.Item>
  );
}