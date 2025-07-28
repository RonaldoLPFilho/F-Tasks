import { useState } from "react";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { HexColorPicker } from "react-colorful";
import { createCategory } from "./CategoryService";
import { CirclePlus, Tags } from "lucide-react";

interface Props{
    onCategoryCreated: () => void;
}

export function CategoryForm({onCategoryCreated} : Props){
    const [name, setName] = useState("");
    const [color, setColor] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            await createCategory({name, color});
            setName("");
            setColor("#aabbcc");
            onCategoryCreated();
        }catch(err){
            console.error("Erro ao criar categoria", err);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-lg p-4"
        >
    
            <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
                <CirclePlus className="w-5 h-5" />
                Criar categoria
            </h1>
            <FloatingLabelInput
                id="Nome"
                label="Nome da categoria"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium">Cor</label>
                <HexColorPicker color={color} onChange={setColor} />
                <div className="text-sm mt-1">
                    Cor selecionada: <span className="font-mono">{color}</span>
                </div>
            </div>

            <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
            >
                Criar
            </button>
        </form>
    )
}