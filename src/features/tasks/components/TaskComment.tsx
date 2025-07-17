import { useState } from "react";
import { Comment } from "../types/Comment";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

interface Props {
    comments : Comment[];
}

export function TaskComments({comments}: Props){
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageSquare className="w-4 h-4"/>
                Comentários
                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen &&(
                <div className="ml-6 mt-2 space-y-2">
                    {comments.map((comment, i) => (
                        <div key={i} className="text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
                            <p className="text-sm font-medium text-gray-600">{comment.author}</p>
                            <p>{comment.description}</p>
                        </div>
                    ))}
                    <input
                        placeholder="Adicionar comentário..."
                        className="w-full border rounded px-2 py-1 text-sm mt-2"
                    />
                </div>
            )}
        </div>
    )
}