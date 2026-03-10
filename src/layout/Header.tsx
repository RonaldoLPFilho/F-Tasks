import { useContext } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, User } from "lucide-react";

export function Header() {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="bg-white py-6 shadow-sm flex justify-center relative z-10">
      <div className="w-[70%] max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Bem-vindo, {username}</h2>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-blue-700 cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              Gerencie sua conta
            </button>
          </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </button>
        </div>
      </div>
    </header>
  );
}
