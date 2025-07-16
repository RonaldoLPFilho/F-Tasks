import {Task} from "../types/Task.ts";
import {deleteTask, toggleTaskCompletion} from "../services/TaskService.ts";
import {useState} from "react";
import {TaskEditModal} from "./TaskEditModal.tsx";
import { CardItem } from "../../../components/CardItem.tsx";
import { ClipboardList } from "lucide-react";
import { TaskCard } from "./TaskCard.tsx";


interface Props {
    tasks: Task[];
    onTasksUpdated: () => void;
}

export function TaskList({tasks, onTasksUpdated}: Props) {

    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleTaskComplete= async (id: number, newStatus: boolean) => {
        try{
            await toggleTaskCompletion(id, newStatus);
            onTasksUpdated();
        }catch(error){
            console.error("Erro ao atualizar o status da tarefa ", error);
        }
    }

    const handleDeleteTask = async (id: number) => {
        try{
            if(confirm("Tem certeza que deseja deletar essa tarefa?")){
                await deleteTask(id);
                onTasksUpdated();
            }
        }catch(error){
            console.error("Erro ao atualizar o task", error);
        }
    }

    const handleEditTask = async (task: Task) => {
        setTaskToEdit(task)
        setIsModalOpen(true);
    }

    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4">
            <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
                <ClipboardList className="w-5 h-5" />
                Lista de tarefas
            </h1>
            <ul className="space-y-2">
                {tasks.map(task => (
                    // <CardItem
                    //     key={task.id}
                    //     title={task.title}
                    //     description={task.description}
                    //     color={task.category.color}
                    //     showCheckbox
                    //     checked={task.completed}
                    //     onCheckToggle={() => toggleTaskComplete(task.id, !task.completed)}
                    //     onEdit={() => handleEditTask(task)}
                    //     onDelete={() => handleDeleteTask(task.id)}
                    // />
                    <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={() => toggleTaskComplete(task.id, !task.completed)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                    />
                ))}
            </ul>
            {isModalOpen && taskToEdit && (
                <TaskEditModal
                    task={taskToEdit}
                    onClose={() => {
                        setIsModalOpen(false)
                        setTaskToEdit(null)
                    }}
                    onSaved={onTasksUpdated}
                />
            )}
        </div>
    );
}



