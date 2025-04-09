import { useEffect, useState } from "react";
import { Task } from "../types/Task";
import { getAllTasks } from "../services/TaskService";
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
            <TaskForm onTaskCreated={loadTasks}/>
            <div className="mt-5"></div>
            <TaskList tasks={tasks} onTasksUpdated={loadTasks}/>
        </div>
    );
}