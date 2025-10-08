import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { ChevronDown, ClipboardList, ClipboardListIcon, Expand, ExpandIcon, ListCollapse, ListCollapseIcon } from "lucide-react";
import { Task } from "../types/Task";
import { TaskEditModal } from "./TaskEditModal";
import { TaskDraggableCard } from "./TaskDraggableCard";
import { deleteTask, toggleTaskCompletion } from "../services/TaskService";
import { reorderTasks } from "../services/TaskService";
import { useCollapse } from "../context/CollapseContext";

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TaskList({ tasks, setTasks }: Props) {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const prevTasksRef = useRef<Task[]>(tasks);
  const {toggleAll, isExpanded} = useCollapse();

  useEffect(() => {
    setLocalTasks(tasks);
    prevTasksRef.current = tasks;
  }, [tasks]);

  const updateTaskInList = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const toggleTaskComplete = async (id: number, newStatus: boolean) => {
    try {
      await toggleTaskCompletion(id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newStatus } : t)));
    } catch (error) {
      console.error("Erro ao atualizar o status da tarefa ", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      if (confirm("Tem certeza que deseja deletar essa tarefa?")) {
        await deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar a task", error);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  //  solta o drag - persiste ordem
  const handleReorderEnd = async () => {
    const orderedIds = localTasks.map((t) => t.id as unknown as string);
    const snapshot = prevTasksRef.current;
    
    setTasks(localTasks);

    try {
      await reorderTasks(orderedIds);
      prevTasksRef.current = localTasks;
    } catch (e) {
      console.error("Falha ao persistir reorder, desfazendo…", e);
      
      // rollback
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
            onToggleComplete={() => toggleTaskComplete(task.id as unknown as number, !task.completed)}
            onEdit={() => handleEditTask(task)}
            onDelete={() => handleDeleteTask(task.id as unknown as number)}
            onUpdateTask={updateTaskInList}
          />
        ))}
      </Reorder.Group>

      {isModalOpen && taskToEdit && (
        <TaskEditModal
          task={taskToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}