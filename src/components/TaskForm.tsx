import {createTask} from "../services/taskService.ts";
import React, {useState} from "react";

interface Props {
    onTaskCreated: () => void;
}

export function TaskForm({onTaskCreated}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault();

        try{
            await createTask({title, description});
            setTitle("");
            setDescription("");
            onTaskCreated();
        }catch(err){
            console.error(err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4"
        >
            <h3 className="text-xl font-semibold">
                Criar nova tarefa
            </h3>

            <input
                type="text"
                placeholder="Titulo"
                value={title}
                required
                className="border border-gray-200 rounded-lg p-4"
                onChange={(e) => setTitle(e.target.value)}
            />
            <br/>
            <textarea
                placeholder="Descricão"
                value={description}
                className="border border-gray-200 rounded-lg px-3 py-2 resize-none"
                onChange={(e) => setDescription(e.target.value)}
            />
            <br/>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">
                Criar
            </button>
        </form>
    )
}