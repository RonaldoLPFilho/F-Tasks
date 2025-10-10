import { Task } from "../types/Task";
import { Archive, CalendarDays, CheckCircle, Circle, Pencil, Trash } from "lucide-react";
import { Divider } from "../../../components/Divider";
import { TaskSubtasks } from "../subtasks/components/TaskSubtasks";
import { TaskComments } from "../comments/components/TaskComment";
import { useState } from "react";
import { useToast } from "../../../components/ToastProvider";
import { Modal } from "../../../components/Modal";

interface TaskCardProps{
    task: Task;
    onToggleComplete: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateTask: (updatedTask: Task) => void;
}

export function TaskCard({task, onToggleComplete, onEdit, onDelete, onUpdateTask}: TaskCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show } = useToast();


  //MOCKADAO POR ENQUANTO 
  //Todo:  Lembrar de ajustar
  async function handleArchiveConfirm() {
    try {
      setSubmitting(true);
      console.log("PATCH /tasks/" + task.id + "/archive");
      const ok = true; 
      if (ok) {
        show({ type: "success", message: "Tarefa arquivada" });
        setConfirmOpen(false);
      } else {
        throw new Error("Erro ao arquivar");
      }
    } catch (e) {
      show({ type: "error", message: "Falha ao arquivar a tarefa" });
    } finally {
      setSubmitting(false);
    }


  }
  
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

                  <div style={{backgroundColor: task.category.color}} className="text-black bold text-xs px-2 py-0.5 rounded-md font-medium">
                    {task.category.name} 
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
            <button onClick={() => setConfirmOpen(true)} title="Arquivar"><Archive className="w-4 h-4 text-gray-500 hover:text-purple-600 cursor-pointer" /></button>
              <button onClick={onEdit}><Pencil className="w-4 h-4 text-gray-500 hover:text-purple-600 cursor-pointer" /></button>
              <button onClick={onDelete}><Trash className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer" /></button>
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

          <Modal
            open={confirmOpen}
            onClose={() => !submitting && setConfirmOpen(false)}
            title="Confirmar arquivamento"
            dismissible={!submitting}
          >
            <p className="text-sm text-gray-700">Realmente deseja arquivar esta tarefa?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                NÃO
              </button>
              <button
                className="rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-500 disabled:opacity-60"
                onClick={handleArchiveConfirm}
                disabled={submitting}
              >
                {submitting ? "Arquivando…" : "SIM"}
              </button>
            </div>
          </Modal>
        </div>
      );
    }
    