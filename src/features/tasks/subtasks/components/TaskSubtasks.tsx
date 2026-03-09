import { CheckCircle, ChevronDown, ChevronUp, Plus, Trash } from "lucide-react";
import { Subtask } from "../types/Substask";
import { useEffect, useState } from "react";
import {
  createSubtask,
  deleteSubtask,
  toggleSubstaskCompletion,
} from "../services/SubtaskService";
import { useCollapse } from "../../context/CollapseContext";
import { ConfirmModal } from "../../../../components/ConfirmModal";

interface Props {
    taskId: string;
    subtasks: Subtask[];
    onSubtasksUpdated: (newSubtasks: Subtask[]) => void;
}

export function TaskSubtasks({ taskId, subtasks, onSubtasksUpdated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  const [subTasksState, setSubtasksState] = useState<Subtask[]>(subtasks);
  const [isSubmitting, setSubmitting] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);
  const { isExpanded } = useCollapse();

    useEffect(() => {
        setIsOpen(isExpanded);
    }, [isExpanded])

    const handleAddSubtask = async () => {
        if(!newSubtask.trim()) return;
        try{
            setSubmitting(true);
            const created = await createSubtask({title: newSubtask, taskId});
            const updated = [...subTasksState, created];
            setSubtasksState(updated);
            onSubtasksUpdated(updated);
            setNewSubtask("");
        }catch(err){
            console.error("Erro ao criar subtarefa", err)
        }finally{
            setSubmitting(false);
        }
    }

  const handleCompletion = async (id: string, completed: boolean) => {
    try {
      await toggleSubstaskCompletion(id, completed);
      const updated = subTasksState.map((s) =>
        s.id === id ? { ...s, completed } : s
      );
      setSubtasksState(updated);
      onSubtasksUpdated(updated);
    } catch (err) {
      console.error("Erro ao alterar subtarefa", err);
    }
  };

  const handleDeleteSubtask = async () => {
    if (!subtaskToDelete) return;
    try {
      await deleteSubtask(subtaskToDelete);
      const updated = subTasksState.filter((s) => s.id !== subtaskToDelete);
      setSubtasksState(updated);
      onSubtasksUpdated(updated);
    } catch (err) {
      console.error("Erro ao excluir subtarefa", err);
    } finally {
      setSubtaskToDelete(null);
    }
  };

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
                    {subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 text-sm mt-4"
                      >
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                          onClick={() =>
                            handleCompletion(sub.id, !sub.completed)
                          }
                        >
                          <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-500 shrink-0">
                            {sub.completed && (
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <span
                            className={
                              sub.completed
                                ? "line-through text-gray-800"
                                : "text-gray-800"
                            }
                          >
                            {sub.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubtaskToDelete(sub.id);
                          }}
                          aria-label={`Excluir subtarefa ${sub.title}`}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddSubtask();
                        }} 
                        className="flex items-center gap-2 mt-4">
                        <input
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            placeholder="Nova subtarefa..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 "
                        />
                        <button 
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg px-3"
                            disabled={!newSubtask.trim() || isSubmitting}
                            onClick={handleAddSubtask}
                        >
                            <Plus className="w-4 h-4"/>
                        </button>
                    </form>
                </div>
            )}

      <ConfirmModal
        isOpen={subtaskToDelete !== null}
        onConfirm={handleDeleteSubtask}
        onCancel={() => setSubtaskToDelete(null)}
      />
        </div>
  );
}