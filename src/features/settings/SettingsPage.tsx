import { useState } from "react";
import { SettingsSection } from "./SettingSection";
import { useNavigate } from "react-router-dom";
import { Globe, KeyRound, LogOut, MoveLeft, Tag, Timer } from "lucide-react";
import { PasswordSettings } from "./password/PasswordSettings";
import { PomodoroSettings } from "./pomodoro/PomodoroSettings";
import { CategorySettings } from "./categories/CategorySettings";
import { LanguageSettings } from "./language/LanguageSettings";
import { LogoutConfirm } from "./LogoutConfirm";

export function SettingsPage(){
    const [activeSection, setActiveSection] = useState<SettingsSection>(SettingsSection.PASSWORD);
    const navigate = useNavigate();

    const menuItems = [
        {label: "Trocar senha", icon: <KeyRound size={16}/>, section: SettingsSection.PASSWORD},
        {label: "Ajustes da IA", icon: <Globe size={16}/>, section: SettingsSection.LANGUAGE},
        {label: "Categorias", icon: <Tag size={16}/>, section: SettingsSection.CATEGORY},
        {label: "Pomodoro", icon: <Timer size={16}/>, section: SettingsSection.POMODORO},
        {label: "Logout", icon: <LogOut size={16}/> , section: SettingsSection.LOGOUT }
    ];

    const renderSection = () => {
        switch (activeSection) {
          case SettingsSection.PASSWORD:
            return <PasswordSettings />;
          case SettingsSection.LANGUAGE:
            return <LanguageSettings />;
          case SettingsSection.CATEGORY:
            return <CategorySettings />;
          case SettingsSection.POMODORO:
            return <PomodoroSettings />;
          case SettingsSection.LOGOUT:
             return <LogoutConfirm/>
          default:
            return null;
        }
      };

    return (
      <div className="max-w-5xl mx-auto py-10">
        <button
          onClick={() => navigate("/tasks")}
          className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-6"
        >
          <MoveLeft size={24}/> <p className="text-sm"> Voltar para tarefas</p> 
        </button>

        <h1 className="text-2xl font-bold mb-6">Configurações</h1>

        <div className="flex gap-6">
          <aside className="w-64 bg-white rounded-xl shadow-p2">
            {menuItems.map((item) => (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 
                  ${activeSection === item.section ? "bg-purple-500 text-white hover:bg-purple-600" : "text-gray-700"}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </aside>

          <section className="flex-1 bg-white rounded-xl shadow p-6">
            {renderSection()}
          </section>
        </div>
      </div>
    )
}