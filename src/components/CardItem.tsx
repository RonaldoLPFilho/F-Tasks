import { li } from "framer-motion/client";

interface CardItemProps {
    title: string,
    color: string;
    showCheckbox?: boolean;
    checked?: boolean;
    onCheckToggle?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function CardItem({
    title,
    color, 
    showCheckbox = false,
    checked = false,
    onCheckToggle,
    onEdit,
    onDelete
}: CardItemProps) {
    return (
        <li className="flex items-center justify-between p3- rounded border shadow-sm hover:shador-md bg-white">
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-10 rounded-l-full"
                    style={{backgroundColor: color}}
                ></div>
                <span className="font-medium">{title}</span>
            </div>

            <div className="flex items-center gap-3">
                {showCheckbox && (
                    <input 
                        type="checkbox"
                        checked={checked}
                        onChange={onCheckToggle}
                    />
                )}
                {onEdit && <button onClick={onEdit}>✏️</button>}
                {onDelete && <button onClick={onDelete}>🗑️</button>}
            </div>
        </li>
    );
}