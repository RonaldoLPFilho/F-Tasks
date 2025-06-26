import { li } from "framer-motion/client";
import { Category } from "../types/Category";

interface Props {
    categories: Category[];
    onCategoriesUpdated: () => void; 
}

export function CategoryList({categories, onCategoriesUpdated}: Props ){
    const handleDelete = async (id: string) => {
        if(confirm("Deseja excluir essa categoria?")){
            //await deleteCategory(id);
            onCategoriesUpdated();
        }
    };

    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold">Categorias Cadastradas</h2>
            <ul className="space-y-2">
                {categories.map((category) => (
                    <li
                        key={category.id}
                        className="flex items-center justify-between p3- rounded border"
                        style={{backgroundColor: category.color}}
                    >
                        <span className="font-medium text-white drop-shadow">{category.name}</span>
                        <button onClick={() => handleDelete(category.id)}>🗑️</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}