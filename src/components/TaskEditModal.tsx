import {Task} from "../types/Task.ts";
import {useState} from "react";
import {updateTask} from "../services/TaskService.ts";

interface Props {
    task: Task;
    onClose: () => void;
    onSaved: () => void;
}

export function TaskEditModal({task, onClose, onSaved} : Props){
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [completed, setCompleted] = useState(task.completed);
    const [jira, setJira] = useState(task.jiraId);
    const [category, setCategory] = useState(task.category);

    const handleSave = async () => {
        try{
            await updateTask(task.id, {title, description, completed, jira, category});
            onSaved()
            onClose()
        }catch(err){
            console.error("Error ao atualizar a task ", err)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg ">
                <h3 className="text-xl font-semibold mb-4">
                    Editar Tarefa
                </h3>

                <div className="flex flex-col gap-2">
                    <input
                        value={title}
                        placeholder="Titulo"
                        autoComplete="off"
                        required
                        className="border border-gray-200 rounded-lg p-4"
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <br/>

                    <textarea
                        value={description}
                        placeholder="Description"
                        autoComplete="off"
                        className="border border-gray-200 rounded-lg p-4"
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <br/>

                    <input
                        value={jira}
                        placeholder="Jira ID"
                        autoComplete="off"
                        required
                        className="border border-gray-200 rounded-lg p-4"
                        onChange={(e) => setJira(e.target.value)}
                    />

                    


                    <div className="flex items-center gap-2 mt-2">
                        <input
                            id="completed"
                            type="checkbox"
                            checked={completed}
                            onChange={(e) => setCompleted(e.target.checked)}
                        />
                        <label htmlFor="completed">Concluído</label>
                    </div>
                </div>

                <br/>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={handleSave}
                    >
                        Salvar
                    </button>
                </div>
            </div>


        </div>
    )
}