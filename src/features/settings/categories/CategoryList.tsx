import { Category } from "../../../types/Category";
import { CardItem } from "../../../components/CardItem";
import { Tags } from "lucide-react";

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
            <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
                <Tags className="w-5 h-5" />
                Minhas categorias
            </h1>
            <ul className="space-y-2">
                {categories.map((category) => (
                    <CardItem
                        key={category.id}
                        title={category.name}
                        color={category.color}
                        onDelete={() => handleDelete(category.id)}
                    />
                ))}
            </ul>
        </div>
    )
}