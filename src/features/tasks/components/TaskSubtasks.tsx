import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Subtask } from "../types/Substask";
import { useState } from "react";

interface Props {
    subtasks: Subtask[];
}

export function TaskSubtasks({subtasks}: Props){
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CheckCircle className="w-4 h-4"/>
                Subtarefas
                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen &&(
                <div className="ml-6 mt-2 space-y-1">
                    {subtasks.map((sub, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={sub.completed} readOnly />
                            <span className={sub.completed ? "line-through text-gray-400" : ""}>{sub.title}</span>
                        </div>
                    ))}
                    <input
                        placeholder="Nova subtarefa..."
                        className="w-full border rounded px-2 py-1 text-sm mt-2"
                    />
                </div>                
            )}
        </div>
    )
}