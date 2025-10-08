import { useEffect, useState } from "react";
import { Task } from "../types/Task";
import { getAllTasks } from "../services/TaskService";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { DailyModal } from "../../daily/components/DailyModal";
import { CollapseProvider } from "../context/CollapseContext";

export function TaskPage(){
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);

    const loadTasks = async () => {
        getAllTasks().then(setTasks).catch(console.error);
    }

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <div className="absolute right">
                    <button
                            onClick={() => setIsDailyModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2  font-semibold"
                        >
                            Iniciar Daily
                    </button>
                    <DailyModal isOpen={isDailyModalOpen} onClose={() => setIsDailyModalOpen(false)} language="es-AR"/>
                </div>
                <TaskForm onTaskCreated={loadTasks}/>
                <div className="mt-5"></div>
                {/* <TaskList tasks={tasks} onTasksUpdated={loadTasks}/> */}
                <CollapseProvider>
                    <TaskList tasks={tasks} setTasks={setTasks} />
                </CollapseProvider>


            </div>
        </>


    );
}