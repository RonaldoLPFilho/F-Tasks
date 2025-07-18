import { useState } from "react";
import { Comment } from "../types/Comment";
import { CalendarDays, ChevronDown, ChevronUp, MessageSquare, Send } from "lucide-react";
import { createComment } from "../services/CommentService";

interface Props {
    taskId: string;
    comments : Comment[];
    onCommentsUpdated: (newComments: Comment[]) => void;
}

export function TaskComments({taskId, comments, onCommentsUpdated}: Props){
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [commentsState, setCommentState] = useState<Comment[]>(comments);

    const handleCreateComment = async () => {
        if (!newComment.trim()) return;

        try{
            const created = await createComment({description: newComment, taskId});
            const updated = [...commentsState, created];
            setCommentState(updated);
            onCommentsUpdated(updated);
            setNewComment("");
        }catch(err){
            console.error("Erro ao aidcionar comentario", err);
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }) + " às " + date.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})
    };

    return (
        <div className="m-4">
            <button
                className="text-lg text-gray-600 flex items-center gap-1 hover:text-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageSquare className="w-4 h-4"/>
                Comentários 
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {commentsState.length}
                </span>

                {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>

            {isOpen &&(
                <div className="ml-6 mt-2 space-y-3">
                    {comments.map((comment) => (
                        <div 
                            key={comment.id} 
                            className="bg-gray-100 rounded-xl p-3 text-sm text-gray-800"
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{comment.author}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <CalendarDays className="w-4 h-4"/>
                                    {formatDate(comment.createdAt)}
                                </div>
                            </div>
                            <p className="mt-1">{comment.description}</p>
                        </div>
                    ))}

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adicionar um comentário..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={handleCreateComment}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg"
                        >
                            <Send className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}