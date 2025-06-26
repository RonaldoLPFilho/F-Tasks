import {createTask} from "../services/TaskService.ts"
import React, {useState} from "react";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput.tsx"
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect.tsx";


interface Props {
    onTaskCreated: () => void;
}

export function TaskForm({onTaskCreated}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [jiraId, setJiraId] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault();

        try{
            await createTask({title, description, jiraId, category});
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

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="jira"
                        label="Jira ID"
                        type="text"
                        value={jiraId}
                        onChange={(e) => setJiraId(e.target.value)}
                    />
                </div>

                <div className="w-full sm:w-1/2">
                    <FloatingLabelSelect
                        id="categoria"
                        label="Categoria"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={[
                            {label: "Teste 1", value: "test1"},
                            {label: "Teste 2", value: "test2"},
                        ]}
                    />
                </div>
            </div>

            <br/>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold">
                Criar
            </button>
        </form>
    )
}