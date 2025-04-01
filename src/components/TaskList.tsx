import {Task} from "../types/Task.ts";
import {toggleTaskCompletion} from "../services/taskService.ts";


interface Props {
    tasks: Task[];
    onTasksUpdated: () => void;
}

export function TaskList({tasks, onTasksUpdated}: Props) {
    const toggleTaskComplete= async (id: number, newStatus: boolean) => {
        try{
            await toggleTaskCompletion(id, newStatus);
            onTasksUpdated();
        }catch(error){
            console.error("Erro ao atualizar o status da tarefa ", error);
        }
    }

    return (
        <div>
            <h2>Lista de Tarefas</h2>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <strong>{task.title}</strong> – {task.completed ? "✅" : "❌"} - <input type="checkbox" checked={task.completed} onChange={() => toggleTaskComplete(task.id, !task.completed)} />
                    </li>
                ))}
            </ul>
        </div>
    );
}



