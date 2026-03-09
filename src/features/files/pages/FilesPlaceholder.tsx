import { Folder } from "lucide-react";

export function FilesPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Folder className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">Arquivos</p>
        <p className="text-sm mt-1">Em breve você poderá gerenciar seus arquivos aqui.</p>
      </div>
    </div>
  );
}
