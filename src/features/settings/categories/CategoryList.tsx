import { Category } from "../../../types/Category";
import { CardItem } from "../../../components/CardItem";
import { Tags } from "lucide-react";

interface Props {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export function CategoryList({categories, onEdit, onDelete}: Props ){
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
                        title={category.defaultCategory ? `${category.name} (padrão)` : category.name}
                        color={category.color}
                        onEdit={() => onEdit(category)}
                        onDelete={() => onDelete(category)}
                    />
                ))}
            </ul>
        </div>
    )
}