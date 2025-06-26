import { useEffect, useState } from "react";
import {Category} from "../types/Category"
import { CategoryForm } from "../components/CategoryForm";
import { CategoryList } from "../components/CategoryList";
import { getAllCategories } from "../services/CategoryService";

export function CategoryPage(){
    const [categories, setCategories] = useState<Category[]>([]);

    const loadCategories = async () => {
        try{
            const data= await getAllCategories();
            setCategories(data);
        }catch(err){
            console.error("Error ao carregar categorias")
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <CategoryForm onCategoryCreated={loadCategories} />
            <div className="mt-5"></div>
            <CategoryList categories={categories} onCategoriesUpdated={loadCategories}/>
        </div>
    )
}