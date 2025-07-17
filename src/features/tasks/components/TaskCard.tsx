import { useState } from "react";
import { Task } from "../types/Task";
import { CalendarDays, CheckCircle, ChevronDown, ChevronUp, Circle, MessageSquare, Pencil, Trash } from "lucide-react";
import { Divider } from "../../../components/Divider";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskComments } from "./TaskComment";
import { comment } from "postcss";

interface TaskCardProps{
    task: Task;
    onToggleComplete: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateTask: (updatedTask: Task) => void;
}

export function TaskCard({task, onToggleComplete, onEdit, onDelete, onUpdateTask}: TaskCardProps) {
    return (
        <div
        className="border-l-4 rounded-xl shadow-sm p-6 m-4 bg-white"
        style={{ borderLeftColor: task.category.color }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">

                <button
                    onClick={onToggleComplete}
                    className="text-gray-600 hover:text-black"
                >
                    {task.completed ? (
                        <CheckCircle size={20} className="text-violet-600" />
                    ) : (
                        <Circle size={20} />
                    )}
                </button>
              
              <div>
                <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
    
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                  </div>
    
                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.subtasks?.length || 0} subtarefas
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
    
          <TaskSubtasks 
            taskId={task.id.toString()}
            subtasks={task.subtasks}
            onSubtasksUpdated={(newSubs) => {
                const updatedTask = { ...task, subtasks: newSubs} ;
                onUpdateTask(updatedTask)
            }}
            
          />
          <Divider/>
          <TaskComments 
              taskId={task.id.toString()} 
              comments={task.comments}
              onCommentsUpdated={(newComments) => {
                const updatedTask = { ...task, comments: newComments} ;
                onUpdateTask(updatedTask)
              }}
          />
        </div>
      );
    }
    