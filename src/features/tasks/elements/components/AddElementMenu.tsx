import { Plus } from "lucide-react";
import { useState } from "react";
import { ElementType } from "../types/TaskElement";
import { elementLabels } from "../registry/ElementRegistry";

const ALL_ELEMENT_TYPES: ElementType[] = ['SUBTASK', 'COMMENT'];

interface Props {
    visibleTypes: ElementType[];
    onAdd: (type: ElementType) => void;
}

export function AddElementMenu({ visibleTypes, onAdd }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const available = ALL_ELEMENT_TYPES.filter(t => !visibleTypes.includes(t));

    if (available.length === 0) return null;

    return (
        <div className="relative m-4 mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-purple-600 transition-colors"
            >
                <Plus className="w-4 h-4"/>
                Adicionar elemento
            </button>
            {isOpen && (
                <div className="absolute left-0 top-7 bg-white border border-gray-200 rounded-lg shadow-md z-10 min-w-[160px]">
                    {available.map(type => (
                        <button
                            key={type}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => { onAdd(type); setIsOpen(false); }}
                        >
                            {elementLabels[type]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
