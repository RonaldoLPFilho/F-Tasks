import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { ChevronDown, ClipboardList } from "lucide-react";
import { Task } from "../types/Task";
import { TaskDraggableCard } from "./TaskDraggableCard";
import { deleteTask, toggleTaskCompletion, reorderTasks } from "../services/TaskService";
import { useCollapse } from "../context/CollapseContext";
import { ConfirmModal } from "../../../components/ConfirmModal";

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tabId: string | null;
  onTasksUpdated: () => void;
}

export function TaskList({ tasks, setTasks, tabId, onTasksUpdated }: Props) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const prevTasksRef = useRef<Task[]>(tasks);
  const { toggleAll, isExpanded } = useCollapse();

  useEffect(() => {
    setLocalTasks(tasks);
    prevTasksRef.current = tasks;
  }, [tasks]);

  const updateTaskInList = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const toggleTaskComplete = async (id: string, newStatus: boolean) => {
    try {
      await toggleTaskCompletion(id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: newStatus } : t))
      );
    } catch (error) {
      console.error("Erro ao atualizar o status da tarefa ", error);
    }
  };

  const handleDeleteTaskClick = (id: string) => {
    setTaskToDelete(id);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
    } catch (error) {
      console.error("Erro ao deletar a task", error);
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleReorderEnd = async () => {
    if (!tabId) return;
    const orderedIds = localTasks.map((t) => t.id);
    const snapshot = prevTasksRef.current;

    setTasks(localTasks);

    try {
      await reorderTasks(tabId, orderedIds);
      prevTasksRef.current = localTasks;
    } catch (e) {
      console.error("Falha ao persistir reorder, desfazendo…", e);
      setLocalTasks(snapshot);
      setTasks(snapshot);
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 shadow-md">
      
      <div className="flex justify-between flex-start">
        <h1 className="m-auto flex gap-2 text-xl font-semibold text-purple-700 mb-4">
          <ClipboardList className="w-5 h-5" />
          Lista de tarefas
        </h1>
      
        <button
          onClick={toggleAll}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Recolher" : "Expandir"}
          title={isExpanded ? "Recolher tudo" : "Expandir tudo"}
          className="text-xl flex"
        >
          <ChevronDown
            className={`w-5 h-5 text-purple-700 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <Reorder.Group
        axis="y"
        values={localTasks}
        onReorder={setLocalTasks}
        className="space-y-2"
      >
        {localTasks.map((task) => (
          <TaskDraggableCard
            key={task.id}
            task={task}
            onDragEnd={handleReorderEnd}
            onToggleComplete={() => toggleTaskComplete(task.id, !task.completed)}
            onDelete={() => handleDeleteTaskClick(task.id)}
            onUpdateTask={updateTaskInList}
          />
        ))}
      </Reorder.Group>

      <ConfirmModal
        isOpen={taskToDelete !== null}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}