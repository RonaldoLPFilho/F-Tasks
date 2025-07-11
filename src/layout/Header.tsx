import { useContext } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Search, User } from "lucide-react";

export function Header() {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="bg-white py-6 shadow-sm flex justify-center">
      <div className="w-[70%] max-w-6xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Bem-vindo, {username}</h2>
            <p className="text-sm text-gray-500">Gerencie suas tarefas de forma eficiente</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-md flex-1 px-3 py-2">
            <Search className="text-gray-500 w-4 h-4 mr-2" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou comentários..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <button className="flex items-center border border-gray-300 px-4 py-2 rounded-md text-sm">
            <CalendarDays className="w-4 h-4 mr-1" />
            Data
          </button>

          <button className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-md text-sm transition">
            <Search className="w-4 h-4 inline mr-1" />
            Buscar
          </button>
        </div>
      </div>
    </header>
  );
}
