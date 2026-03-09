import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useTabs } from "../context/TabsContext";
import { RemoveTabModal } from "./RemoveTabModal";
import { Tab } from "../types/Tab";
import { getTabById } from "../services/TabService";

const MAX_TAB_NAME_LENGTH = 20;

export function TabsBar() {
  const { tabs, activeTabId, selectTab, createTab, removeTab } = useTabs();
  const [isCreating, setIsCreating] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [tabToRemove, setTabToRemove] = useState<Tab | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleCreateClick = () => {
    setIsCreating(true);
    setNewTabName("");
    setCreateError(null);
  };

  const handleCreateConfirm = async () => {
    const name = newTabName.trim();
    if (!name) {
      setCreateError("Digite um nome para a aba.");
      return;
    }
    if (name.length > MAX_TAB_NAME_LENGTH) {
      setCreateError(`O nome da aba deve ter no máximo ${MAX_TAB_NAME_LENGTH} caracteres.`);
      return;
    }

    const tab = await createTab(name);
    if (tab) {
      setIsCreating(false);
      setNewTabName("");
      setCreateError(null);
    } else {
      setCreateError("Máximo de 5 abas ativas. Arquivar ou remover uma aba primeiro.");
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setNewTabName("");
    setCreateError(null);
  };

  const handleRemoveClick = async (tab: Tab) => {
    try {
      const fullTab = await getTabById(tab.id);
      setTabToRemove(fullTab);
    } catch {
      setTabToRemove(tab);
    }
  };

  const handleRemoveConfirm = async (password: string) => {
    if (!tabToRemove) return false;
    const hasTasks = (tabToRemove.tasks?.length ?? 0) > 0;
    const success = await removeTab(tabToRemove.id, hasTasks ? password : undefined);
    if (success) {
      setTabToRemove(null);
    }
    return success;
  };

  const handleRemoveCancel = () => {
    setTabToRemove(null);
  };

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-200 flex justify-center">
        <div className="w-[70%] max-w-6xl flex items-end overflow-x-auto">
          <div className="flex items-end gap-0 min-w-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`
                  flex items-center gap-1 px-4 py-2 rounded-t-lg border border-b-0 border-gray-200 min-w-0
                  transition-colors cursor-pointer group
                  ${
                    activeTabId === tab.id
                      ? "bg-white border-gray-200 -mb-px"
                      : "bg-gray-200/60 hover:bg-gray-200 text-gray-700"
                  }
                `}
                onClick={() => selectTab(tab.id)}
              >
                <span className="truncate max-w-[120px] text-sm font-medium">
                  {tab.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick(tab);
                  }}
                  aria-label={`Remover aba ${tab.name}`}
                  className="p-0.5 rounded hover:bg-gray-300/80 text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {isCreating ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-t-lg border border-b-0 border-gray-200 -mb-px">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTabName}
                  maxLength={MAX_TAB_NAME_LENGTH}
                  onChange={(e) => {
                    setNewTabName(e.target.value);
                    setCreateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateConfirm();
                    if (e.key === "Escape") handleCreateCancel();
                  }}
                  placeholder="Nome da aba"
                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleCreateConfirm}
                  className="rounded px-2 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700"
                >
                  Ok
                </button>
                <button
                  onClick={handleCreateCancel}
                  aria-label="Cancelar"
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateClick}
                aria-label="Adicionar nova aba"
                className="p-2 rounded-t-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors -mb-px"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {createError && (
        <p className="text-red-600 text-sm text-center py-1 bg-red-50">
          {createError}
        </p>
      )}

      {tabToRemove && (
        <RemoveTabModal
          tabName={tabToRemove.name}
          hasTasks={(tabToRemove.tasks?.length ?? 0) > 0}
          onConfirm={handleRemoveConfirm}
          onCancel={handleRemoveCancel}
        />
      )}
    </>
  );
}
