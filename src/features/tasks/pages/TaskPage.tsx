import { useCallback, useEffect, useState } from "react";
import { TaskForm } from "../components/TaskForm";
import { TaskSearchPanel } from "../components/TaskSearchPanel";
import { TaskSectionsBoard } from "../components/TaskSectionsBoard";
import { CollapseProvider } from "../context/CollapseContext";
import { TabsProvider, useTabs } from "../../tabs/context/TabsContext";
import { TabsBar } from "../../tabs/components/TabsBar";
import {
    SectionMenu,
    type PageSection,
} from "../../tabs/components/SectionMenu";
import { FilesPlaceholder } from "../../files/pages/FilesPlaceholder";
import { getSections } from "../services/SectionService";
import { TaskSection } from "../types/TaskSection";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

export function TaskPage() {
    const [activeSection, setActiveSection] = useState<PageSection>("tarefas");

    return (
        <TabsProvider>
            <SectionMenu
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            {activeSection === "tarefas" && <TabsBar />}
            {activeSection === "tarefas" ? (
                <TaskPageContent />
            ) : (
                <FilesPlaceholder />
            )}
        </TabsProvider>
    );
}

function TaskPageContent() {
    const { activeTabId } = useTabs();
    const [sections, setSections] = useState<TaskSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useToast();

    const loadSections = useCallback(async () => {
        if (!activeTabId) {
            setIsLoading(false);
            setSections([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await getSections(activeTabId);
            setSections(data);
        } catch (error) {
            showError(
                extractApiErrorMessage(
                    error,
                    "Não foi possível carregar as sections.",
                ),
            );
            setSections([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTabId, showError]);

    useEffect(() => {
        void loadSections();
    }, [loadSections]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <TaskSearchPanel tabId={activeTabId} />
            <div className="mt-5" />
            <TaskForm tabId={activeTabId} onTaskCreated={loadSections} />
            <div className="mt-5" />
            <CollapseProvider>
                {activeTabId ? (
                    isLoading ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-md">
                            Carregando sections...
                        </div>
                    ) : (
                        <TaskSectionsBoard
                            sections={sections}
                            setSections={setSections}
                            tabId={activeTabId}
                            onSectionsUpdated={loadSections}
                        />
                    )
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-md">
                        Crie ou selecione uma aba para organizar tarefas por
                        section.
                    </div>
                )}
            </CollapseProvider>
        </div>
    );
}
