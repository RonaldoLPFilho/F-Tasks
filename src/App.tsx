import './App.css'
import {TaskList} from "./components/TaskList.tsx";
import {Task} from "./types/Task.ts";
import {getAllTasks} from "./services/taskService.ts";
import {useEffect, useState} from "react";
import {TaskForm} from "./components/TaskForm.tsx";

function App() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadTasks = async () => {
        getAllTasks().then(setTasks).catch(console.error);
    }

    useEffect(() => {
        loadTasks();
    }, [])


    return (
        <div>
            <h1>Tasks app</h1>
            <TaskForm onTaskCreated={loadTasks} />
            <TaskList tasks={tasks} onTasksUpdated={loadTasks} />
        </div>
    )
}

export default App;
