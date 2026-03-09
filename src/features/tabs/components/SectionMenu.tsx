import { ClipboardList, Folder } from "lucide-react";

export type PageSection = "tarefas" | "arquivos";

interface SectionMenuProps {
  activeSection: PageSection;
  onSectionChange: (section: PageSection) => void;
}

export function SectionMenu({ activeSection, onSectionChange }: SectionMenuProps) {
  return (
    <div className="bg-white border-b border-gray-200 flex justify-center">
      <div className="w-[70%] max-w-6xl">
        <nav className="flex gap-0">
          <button
            onClick={() => onSectionChange("tarefas")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${
                activeSection === "tarefas"
                  ? "text-gray-900 border-purple-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <ClipboardList className="w-4 h-4" />
            Tarefas
          </button>
          <button
            onClick={() => onSectionChange("arquivos")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${
                activeSection === "arquivos"
                  ? "text-gray-900 border-purple-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <Folder className="w-4 h-4" />
            Arquivos
          </button>
        </nav>
      </div>
    </div>
  );
}
