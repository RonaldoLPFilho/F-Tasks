import { useContext } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header(){
    const {username, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }


    return (
        <header className="bg-purple-700 text-white py-4 px-6 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/tasks")}>
                📋 TasksApp
            </h1>

            <div className="flex items-center gap-4">
                <span className="text-sm">{username}</span>
                <span>⚙️</span>
                <button 
                        onClick={handleLogout}
                        className="bg-white text-purple-700 px-3 py-1 rounded-md hover:bg-purple-200 transition text-sm"
                    >
                    Sair
                </button>
            </div>
        </header>
    )
}