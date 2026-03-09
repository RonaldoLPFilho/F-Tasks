import { useCallback, useEffect, useState } from "react";
import { Task } from "../types/Task";
import { getAllTasks } from "../services/TaskService";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { DailyModal } from "../../daily/components/DailyModal";
import { CollapseProvider } from "../context/CollapseContext";
import { TabsProvider, useTabs } from "../../tabs/context/TabsContext";
import { TabsBar } from "../../tabs/components/TabsBar";
import { SectionMenu, type Section } from "../../tabs/components/SectionMenu";
import { FilesPlaceholder } from "../../files/pages/FilesPlaceholder";

export function TaskPage() {
  const [activeSection, setActiveSection] = useState<Section>("tarefas");

  return (
    <TabsProvider>
      <SectionMenu activeSection={activeSection} onSectionChange={setActiveSection} />
      {activeSection === "tarefas" && <TabsBar />}
      {activeSection === "tarefas" ? <TaskPageContent /> : <FilesPlaceholder />}
    </TabsProvider>
  );
}

function TaskPageContent() {
  const { activeTabId } = useTabs();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!activeTabId) {
      setTasks([]);
      return;
    }
    getAllTasks(activeTabId).then(setTasks).catch(console.error);
  }, [activeTabId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="absolute right">
        <button
          onClick={() => setIsDailyModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 font-semibold"
        >
          Iniciar Daily
        </button>
        <DailyModal
          isOpen={isDailyModalOpen}
          onClose={() => setIsDailyModalOpen(false)}
          language="es-AR"
        />
      </div>
      <TaskForm tabId={activeTabId} onTaskCreated={loadTasks} />
      <div className="mt-5" />
      <CollapseProvider>
        <TaskList
          tasks={tasks}
          setTasks={setTasks}
          tabId={activeTabId}
          onTasksUpdated={loadTasks}
        />
      </CollapseProvider>
    </div>
  );
}