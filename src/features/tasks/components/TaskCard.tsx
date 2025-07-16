import { useState } from "react";
import { Task } from "../types/Task";
import { CalendarDays, CheckCircle, ChevronDown, ChevronUp, MessageSquare, Pencil, Trash } from "lucide-react";
import { Divider } from "../../../components/Divider";

interface TaskCardProps{
    task: Task;
    onToggleComplete: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function TaskCard({task, onToggleComplete, onEdit, onDelete}: TaskCardProps) {
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [showComments, setShowComments] = useState(false)

    // ${task.completed ? 'border-green-500' : 'border-purple-500'}

    return (
        <div
        className="border-l-4 rounded-xl shadow-sm p-6 m-4 bg-white"
        style={{ borderLeftColor: task.category.color }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={onToggleComplete}
                className="mt-1"
              />
              <div>
                <h3 className={`text-base font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
    
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                  </div>
    
                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.subtasks?.length || 0}/{task.subtasks?.length || 0} subtarefas
                  </div>
    
                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.comments?.length || 0} comentário(s)
                  </div>
                </div>
    
                <p className="text-sm text-gray-600 mt-6 mb-6">{task.description}</p>
              </div>
            </div>
    
            <div className="flex gap-2">
              <button onClick={onEdit}><Pencil className="w-4 h-4 text-gray-500 hover:text-purple-600" /></button>
              <button onClick={onDelete}><Trash className="w-4 h-4 text-red-500 hover:text-red-700" /></button>
            </div>
          </div>
    
          {/* Subtarefas */}
          <div className="m-4">
            <button
              className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              <CheckCircle className="w-4 h-4" />
              Subtarefas
              {showSubtasks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
    
            {showSubtasks && (
              <div className="ml-6 mt-2 space-y-1">
                {task.subtasks?.map((sub, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
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

          <Divider/>
    
          {/* Comentários */}
          <div className="m-4">
            <button
              className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              Comentários
              {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
    
            {showComments && (
              <div className="ml-6 mt-2 space-y-2">
                {task.comments?.map((c, i) => (
                  <div key={i} className="text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
                    <p className="text-sm font-medium text-gray-600">{c.author}</p>
                    <p>{c.description}</p>
                  </div>
                ))}
                <input
                  placeholder="Adicionar comentário..."
                  className="w-full border rounded px-2 py-1 text-sm mt-2"
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    