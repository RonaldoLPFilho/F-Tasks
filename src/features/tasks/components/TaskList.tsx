import { Task } from "../types/Task.ts";
import { deleteTask, toggleTaskCompletion } from "../services/TaskService.ts";
import { useState } from "react";
import { TaskEditModal } from "./TaskEditModal.tsx";
import { ClipboardList } from "lucide-react";
import { TaskCard } from "./TaskCard.tsx";

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TaskList({ tasks, setTasks }: Props) {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateTaskInList = (updatedTask: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );
    setTasks(updatedTasks);
  };

  const toggleTaskComplete = async (id: number, newStatus: boolean) => {
    try {
      await toggleTaskCompletion(id, newStatus);
      // Aqui você poderia fazer um update no estado também se quiser evitar recarregar toda a lista
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, completed: newStatus } : t
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Erro ao atualizar o status da tarefa ", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      if (confirm("Tem certeza que deseja deletar essa tarefa?")) {
        await deleteTask(id);
        const filteredTasks = tasks.filter((t) => t.id !== id);
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error("Erro ao deletar a task", error);
    }
  };

  const handleEditTask = async (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 shadow-md">
      <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
        <ClipboardList className="w-5 h-5" />
        Lista de tarefas
      </h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={() => toggleTaskComplete(task.id, !task.completed)}
            onEdit={() => handleEditTask(task)}
            onDelete={() => handleDeleteTask(task.id)}
            onUpdateTask={updateTaskInList}
          />
        ))}
      </ul>
      {isModalOpen && taskToEdit && (
        <TaskEditModal
          task={taskToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSaved={() => {
            // Aqui você pode recarregar a lista inteira se preferir
          }}
        />
      )}
    </div>
  );
}
