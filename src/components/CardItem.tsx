import { li } from "framer-motion/client";
import { CheckCircle, Circle, Pencil, Trash2 } from "lucide-react";

interface CardItemProps {
    title: string,
    description?: string;
    color: string;
    showCheckbox?: boolean;
    checked?: boolean;
    onCheckToggle?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

interface CardItemProps {
    title: string;
    description?: string;
    color: string;
    checked?: boolean;
    showCheckbox?: boolean;
    onCheckToggle?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function CardItem({
    title,
    description,
    color,
    checked = false,
    showCheckbox = false,
    onCheckToggle,
    onEdit,
    onDelete
}: CardItemProps) {
    return (
        <li className="relative flex items-start justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 pl-5">

            <div
                className="absolute top-0 bottom-0 left-0 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex items-start gap-3 w-full">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {showCheckbox && (
                            <button
                                onClick={onCheckToggle}
                                className="text-gray-600 hover:text-black"
                            >
                                {checked ? (
                                    <CheckCircle size={20} className="text-violet-600" />
                                ) : (
                                    <Circle size={20} />
                                )}
                            </button>
                        )}
                        <span className={`font-semibold text-gray-900 ${checked ? "line-through" : ""}`}>
                            {title}
                        </span>
                    </div>
                    {description && (
                        <span className={`text-sm ${checked ? "text-gray-400 line-through" : "text-gray-500"}`}>
                            {description}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-5 ml-4">
                {onEdit && (
                    <button onClick={onEdit} className="text-gray-500 hover:text-blue-600">
                        <Pencil size={18} />
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete} className="text-gray-500 hover:text-red-600">
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </li>
    );
}