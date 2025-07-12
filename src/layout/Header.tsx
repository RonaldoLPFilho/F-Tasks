import { useContext, useState } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { DatePicker } from "../components/DatePicker";

export function Header() {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date| undefined>();

  return (
    <header className="bg-white py-6 shadow-sm flex justify-center relative z-10">
      <div className="w-[70%] max-w-6xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Bem-vindo, {username}</h2>
            <a className="text-sm text-gray-500 hover:text-blue-700 cursor-pointer" onClick={()=> navigate("/categories")}>Gerencie sua conta</a>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="flex items-center border border-gray-300 rounded-md flex-1 px-3 py-2">
            <Search className="text-gray-500 w-4 h-4 mr-2" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou comentários..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate}/>

          <button className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-md text-sm transition">
            <Search className="w-4 h-4 inline mr-1" />
            Buscar
          </button>
        </div>
      </div>
    </header>
  );
}
