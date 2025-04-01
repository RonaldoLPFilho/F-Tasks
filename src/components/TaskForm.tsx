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
        <form onSubmit={handleSubmit}>
            <h3>Criar nova tarefa</h3>
            <input
                type="text"
                placeholder="Titulo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <br/>
            <textarea
                placeholder="Descricão"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <br/>
            <button type="submit">Criar</button>
        </form>
    )
}