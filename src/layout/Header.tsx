import { useContext } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserDropdownMenu } from "../components/UserDropdownMenu";
import { ClipboardList } from "lucide-react";

export function Header(){
    const {username, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }


    return (
        <header className="bg-purple-700 text-white py-4 px-6 flex justify-between items-center shadow-md">
            
            <h1
                className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                onClick={() => navigate("/tasks")}
            >
                <ClipboardList className="w-5 h-5" />
                TasksApp
            </h1>
            
            <UserDropdownMenu username={username} onLogout={handleLogout}/>
        </header>
    )
}