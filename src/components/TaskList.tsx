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
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>

                        – {task.completed ? "✅" : "❌"} -
                        <input type="checkbox" checked={task.completed}
                               onChange={() => toggleTaskComplete(task.id, !task.completed)}
                        />
                        <strong>{task.title}</strong>
                        -
                        <button onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                        -
                        <button onClick={() =>  handleEditTask(task)}>✏️</button>
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



