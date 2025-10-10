import {createTask} from "../services/TaskService.ts"
import React, {useEffect, useState} from "react";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput.tsx"
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect.tsx";
import { Category } from "../../../types/Category.ts";
import { getAllCategories } from "../../settings/categories/CategoryService.ts";
import { FilePenLine } from "lucide-react";


interface Props {
    onTaskCreated: () => void;
}

export function TaskForm({onTaskCreated}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [jiraId, setJiraId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getAllCategories()
            .then(setCategories)
            .catch((err) => console.error("Erro ao carregar categorias", err))
    }, [])

    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault();

        try{
            await createTask({title, description, jiraId, categoryId});
            setTitle("");
            setDescription("");
            setCategoryId("");
            onTaskCreated();
        }catch(err){
            console.error(err);
        }
    }; 

    const categoryOptions = categories.map((cat) => ({
        label: cat.name,
        value: cat.id, 
    }));

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 mb-4 shadow-md"
        >
            <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
                <FilePenLine className="w-5 h-5" />
                Criar tarefa
            </h1>
            
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
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        options={categoryOptions}
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