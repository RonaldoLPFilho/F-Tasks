import {createTask} from "../services/TaskService.ts";
import React, {useState} from "react";
import { FloatingLabelInput } from "./FloatingLabelInput.tsx";


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
            <h1 className="text-xl font-semibold text-center">Criar tarefa</h1>
            <FloatingLabelInput
                id="titulo"
                label="Titulo"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <br/>
            <FloatingLabelInput
                id="descricao"
                label="Descrição"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <br/>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold">
                Criar
            </button>
        </form>
    )
}