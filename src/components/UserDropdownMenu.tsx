import { div } from "framer-motion/client";
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    username: string;
    onLogout: () => void;
}

export function UserDropdownMenu({username, onLogout}: Props){
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(menuRef.current && !menuRef.current.contains(e.target as Node)){
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    },  []);

    return (
        <div className="relative flex items-center gap-4" ref={menuRef}>
            <span className="text-sm">{username}</span>
            <span
                className="cursor-pointer hover:opacity-80 transition"
                onClick={() => setOpen(!open)}
            >
                <Settings/>
            </span>
            {open && (
                <div className="absolute right-16 top-10 bg-white text-black rounded-md shadow-md py-2 w-32 z-10">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-sm"
                        onClick={() => {
                            setOpen(false);
                            navigate("/categories");
                        }}
                    >
                        Categorias
                    </button>
                </div>
            )}

            <button
                onClick={onLogout}
                className="bg-white text-purple-700 px-3 py-1 rounded-md hover:bg-purple-200 transition text-sm"
            >
                Sair
            </button>
        </div>
    )
}