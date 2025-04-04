import { useEffect, useState } from "react";
import { Task } from "../types/Task";
import { getAllTasks } from "../services/taskService";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export function TaskPage(){
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadTasks = async () => {
        getAllTasks().then(setTasks).catch(console.error);
    }

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Minhas tarefas</h1>
            <TaskForm onTaskCreated={loadTasks}/>
            <TaskList tasks={tasks} onTasksUpdated={loadTasks}/>
        </div>
    );
}