import {Task} from "../types/Task.ts";
import {deleteTask, toggleTaskCompletion} from "../services/taskService.ts";
import {useState} from "react";
import {TaskEditModal} from "./TaskEditModal.tsx";


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
        <div>
            <h2>Lista de Tarefas</h2>
            <ul className="space-y-2">
                {tasks.map(task => (
                    <li
                        key={task.id}
                        className="flex items-center justify-between bg-grey-50 p-3 rounded border"
                    >
                        <div>
                            <p className={`font-medium ${task.completed ? "line-through" : ""}`}> {task.title}</p>
                            <p className={`text-sm text-gray-500 ${task.completed ? "line-through" : ""}`}>{task.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskComplete(task.id, !task.completed)}
                            />
                            <button onClick={() => handleEditTask(task)}>✏️</button>
                            <button onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                        </div>
                    </li>
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



