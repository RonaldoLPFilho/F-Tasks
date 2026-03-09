import { useEffect, useState } from "react";
import {Category} from "../../../types/Category"
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import { deleteCategory, getAllCategories, updateCategory } from "./CategoryService";
import { CategoryUpsertModal } from "./CategoryUpsertModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

export function CategorySettings(){
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const { showSuccess, showError } = useToast();

    const loadCategories = async () => {
        try{
            const data= await getAllCategories();
            setCategories(data);
        }catch(err){
            console.error("Error ao carregar categorias", err)
            showError(extractApiErrorMessage(err, "Não foi possível carregar as categorias."));
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleUpdateCategory = async (data: { name: string; color: string }) => {
        if (!categoryToEdit) {
            return;
        }

        try {
            await updateCategory(categoryToEdit.id, data);
            await loadCategories();
            showSuccess("Categoria atualizada com sucesso.");
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível atualizar a categoria."));
            throw error;
        }
    };

    const handleDeleteCategory = async (replacementCategoryId?: string) => {
        if (!categoryToDelete) {
            return;
        }

        try {
            await deleteCategory(categoryToDelete.id, replacementCategoryId);
            await loadCategories();
            showSuccess("Categoria removida com sucesso.");
        } catch (error) {
            showError(extractApiErrorMessage(error, "Não foi possível remover a categoria."));
            throw error;
        }
    };

    return (
        <div>
            <CategoryForm onCategoryCreated={loadCategories} />
            <div className="mt-5"></div>
            <CategoryList
                categories={categories}
                onEdit={setCategoryToEdit}
                onDelete={setCategoryToDelete}
            />

            <CategoryUpsertModal
                isOpen={categoryToEdit !== null}
                category={categoryToEdit}
                onClose={() => setCategoryToEdit(null)}
                onSubmit={handleUpdateCategory}
            />

            <DeleteCategoryModal
                isOpen={categoryToDelete !== null}
                category={categoryToDelete}
                categories={categories}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDeleteCategory}
            />
        </div>
    )
}