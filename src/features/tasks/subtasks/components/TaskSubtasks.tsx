import { BadgePlus, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Subtask } from "../types/Substask";
import { useState } from "react";
import { createSubtask, toggleSubstaskCompletion } from "../services/SubtaskService";

interface Props {
    taskId: string;
    subtasks: Subtask[];
    onSubtasksUpdated: (newSubtasks: Subtask[]) => void;
}

export function TaskSubtasks({taskId, subtasks, onSubtasksUpdated}: Props){
    const [isOpen, setIsOpen] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");

    const total = subtasks.length;
    const completed = subtasks.filter(s => s.completed).length;

    const[subTasksState, setSubtasksState] = useState<Subtask[]>(subtasks);

    const handleAddSubtask = async () => {
        if(!newSubtask.trim()) return;

        try{
            const created = await createSubtask({title: newSubtask, taskId});
            const updated = [...subTasksState, created];
            setSubtasksState(updated);
            onSubtasksUpdated(updated);
            setNewSubtask("");
        }catch(err){
            console.error("Erro ao criar subtarefa", err)
        }
    }

    const handleCompletion = async (id: string, completed: boolean) => {
        try{
            await toggleSubstaskCompletion(id, completed);
            const updated = subTasksState.map(s => 
                s.id === id ? {...s, completed} : s
            );
            setSubtasksState(updated);
            onSubtasksUpdated(updated);
        }catch(err){
            console.error("Erro ao alterar subtrefa", err);
        }
    }

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CheckCircle className="w-5 h-5"/>
                Subtarefas
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {completed}/{total}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen &&(
                <div className="ml-6 space-y-2">
                    {subtasks.map((sub, i) => (
                        <div 
                            key={i} 
                            className="flex items-center gap-2 text-sm mt-4"
                            onClick={() => handleCompletion(sub.id, !sub.completed)}
                        >
                            <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-500"> 
                                {sub.completed && <CheckCircle className="h-4 h-4 text-purple-600"/>}
                            </div>
                            <span className={sub.completed ? "line-through text-gray-800" : ""}>{sub.title}</span>
                        </div>
                    ))}
                    
                    <div className="flex items-center gap-2 mt-4">
                        <input
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            placeholder="Nova subtarefa..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 "
                        />
                        <button 
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg px-3"
                            onClick={handleAddSubtask}
                        >
                            <BadgePlus className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}