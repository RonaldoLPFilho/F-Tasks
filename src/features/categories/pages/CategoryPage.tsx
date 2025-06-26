import { useEffect, useState } from "react";
import {Category} from "../types/Category"
import { useNavigate } from "react-router-dom";
import { div } from "framer-motion/client";
import { CategoryForm } from "../components/CategoryForm";

export function CategoryPage(){
    const [categories, setCategories] = useState<Category[]>([]);

    const loadCategories = async () => {
        try{
            //const data= await getAllCategories();
            //setCategories(data);
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
        </div>
    )
}