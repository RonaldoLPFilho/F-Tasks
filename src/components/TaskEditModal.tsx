import {Task} from "../types/Task.ts";
import {useState} from "react";
import {updateTask} from "../services/taskService.ts";

interface Props {
    task: Task;
    onClose: () => void;
    onSaved: () => void;
}

export function TaskEditModal({task, onClose, onSaved} : Props){
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [completed, setCompleted] = useState(task.completed)

    const handleSave = async () => {
        try{
            await updateTask(task.id, {title, description, completed});
            onSaved()
            onClose()
        }catch(err){
            console.error("Error ao atualizar a task ", err)
        }
    }

    return (
        <div className="modal">
            <h3>Editar Tarefa</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo" autoComplete="off" required/>
            <br/>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" autoComplete="off"/>
            <br/>
            <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)}/>
            <br/>
            <button onClick={handleSave} type="submit">Salvar</button>
            <button onClick={onClose} type="button">Cancelar</button>
        </div>
    )
}