import { useEffect, useState } from "react";
import {Category} from "../../../types/Category"
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import { getAllCategories } from "./CategoryService";

export function CategorySettings(){
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
        <div>
            <CategoryForm onCategoryCreated={loadCategories} />
            <div className="mt-5"></div>
            <CategoryList categories={categories} onCategoriesUpdated={loadCategories}/>
        </div>
    )
}