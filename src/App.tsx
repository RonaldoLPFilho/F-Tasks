import './App.css'
// import {TaskList} from "./components/TaskList.tsx";
// import {Task} from "./types/Task.ts";
// import {getAllTasks} from "./services/taskService.ts";
// import {useEffect, useState} from "react";
// import {TaskForm} from "./components/TaskForm.tsx";

import { AppRoutes } from "./routes/AppRoutes";

// function App() {
//     const [tasks, setTasks] = useState<Task[]>([]);

//     const loadTasks = async () => {
//         getAllTasks().then(setTasks).catch(console.error);
//     }

//     useEffect(() => {
//         loadTasks();
//     }, [])

//     return (
//         <div className="min-h-screen bg-grey-100 p-6">
//             <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6">
//                 <h1 className="text-3xl font-bold text-blue-600 text-center">
//                     Tasks app
//                 </h1>

//                 <TaskForm onTaskCreated={loadTasks}/>
//                 <TaskList tasks={tasks} onTasksUpdated={loadTasks}/>
//             </div>
//         </div>
//     )
// }

// export default App;


function App(){
    return <AppRoutes/>
}

export default App;