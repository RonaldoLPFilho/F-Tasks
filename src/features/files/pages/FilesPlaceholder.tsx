import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowRightLeft,
  FileArchive,
  FileText,
  FolderArchive,
  KeyRound,
  RotateCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { getSections } from "../../tasks/services/SectionService";
import { TaskSection } from "../../tasks/types/TaskSection";
import { splitHighlightedText } from "../../tasks/utils/highlightSearchText";
import { CollapseProvider } from "../../tasks/context/CollapseContext";
import { TaskCard } from "../../tasks/components/TaskCard";
import { getTabs } from "../../tabs/services/TabService";
import { Tab } from "../../tabs/types/Tab";
import {
  restoreArchivedSection,
  restoreArchivedTab,
  restoreArchivedTask,
  searchArchivedItems,
} from "../services/ArchiveService";
import { ArchivedSearchResult } from "../types/ArchivedItem";

type FilesSection = "archived" | "files" | "keyValue" | "howTo";

const menuItems: Array<{
  id: FilesSection;
  title: string;
  subtitle: string;
  icon: typeof Archive;
}> = [
  { id: "archived", title: "Arquivados", subtitle: "Tabs, sections e tasks", icon: Archive },
  { id: "files", title: "Arquivos", subtitle: "Anexos e documentos", icon: FileArchive },
  { id: "keyValue", title: "Chave e Valor", subtitle: "Credenciais e dados", icon: KeyRound },
  { id: "howTo", title: "How To Do", subtitle: "Tutoriais e guias", icon: FileText },
];

function DevelopmentPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Wrench className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      <p className="mt-6 text-sm font-medium text-amber-700">Em desenvolvimento</p>
    </div>
  );
}

function HighlightedSnippet({
  snippet,
  matchedTerms,
}: {
  snippet: string;
  matchedTerms: string[];
}) {
  return (
    <p className="text-sm text-gray-700">
      {splitHighlightedText(snippet, matchedTerms).map((part, index) =>
        part.highlighted ? (
          <mark key={index} className="rounded bg-yellow-200 px-0.5 text-gray-900">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function ArchivedTaskModal({
  result,
  onClose,
  onRestore,
  onMove,
}: {
  result: ArchivedSearchResult;
  onClose: () => void;
  onRestore: () => void;
  onMove: () => void;
}) {
  const task = result.task;

  if (!task) {
    return null;
  }

  const highlightTerms = Array.from(
    new Set(result.matches.flatMap((match) => match.matchedTerms)),
  );

  const hasArchivedParents = Boolean(result.parentTabArchived || result.parentSectionArchived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar task"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Visualizando item arquivado.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {result.parentTabName ?? "Sem aba"} / {result.parentSectionName ?? "Sem section"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasArchivedParents ? (
                <button
                  type="button"
                  onClick={onRestore}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Desarquivar pais juntos
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRestore}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Desarquivar task
                </button>
              )}
              <button
                type="button"
                onClick={onMove}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Escolher destino
              </button>
            </div>
          </div>

          <CollapseProvider initialExpanded>
            <TaskCard
              task={task}
              readOnly
              highlightTerms={highlightTerms}
              onToggleComplete={() => undefined}
              onDelete={() => undefined}
              onUpdateTask={() => undefined}
            />
          </CollapseProvider>
        </div>
      </div>
    </div>
  );
}

function ArchivedContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArchivedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTaskResult, setSelectedTaskResult] = useState<ArchivedSearchResult | null>(null);
  const [pendingTabRestore, setPendingTabRestore] = useState<ArchivedSearchResult | null>(null);
  const [pendingSectionRestoreWithParents, setPendingSectionRestoreWithParents] = useState<ArchivedSearchResult | null>(null);
  const [pendingTaskRestoreWithParents, setPendingTaskRestoreWithParents] = useState<ArchivedSearchResult | null>(null);
  const [sectionDestinationResult, setSectionDestinationResult] = useState<ArchivedSearchResult | null>(null);
  const [taskDestinationResult, setTaskDestinationResult] = useState<ArchivedSearchResult | null>(null);
  const [activeTabs, setActiveTabs] = useState<Tab[]>([]);
  const [availableSections, setAvailableSections] = useState<TaskSection[]>([]);
  const [selectedTabId, setSelectedTabId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const { showError, showSuccess } = useToast();

  const performSearch = async (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchArchivedItems(value);
      setResults(data);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível buscar os itens arquivados."));
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void performSearch(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const isDestinationModalOpen = Boolean(sectionDestinationResult || taskDestinationResult);

  useEffect(() => {
    if (!isDestinationModalOpen) {
      setActiveTabs([]);
      setAvailableSections([]);
      setSelectedTabId("");
      setSelectedSectionId("");
      return;
    }

    getTabs()
      .then((data) => {
        setActiveTabs(data);
        if (data[0]) {
          setSelectedTabId(data[0].id);
        }
      })
      .catch((error) => {
        showError(extractApiErrorMessage(error, "Não foi possível carregar as tabs ativas."));
      });
  }, [isDestinationModalOpen, showError]);

  useEffect(() => {
    if (!selectedTabId || !taskDestinationResult) {
      setAvailableSections([]);
      setSelectedSectionId("");
      return;
    }

    getSections(selectedTabId)
      .then((data) => {
        setAvailableSections(data);
        setSelectedSectionId(data[0]?.id ?? "");
      })
      .catch((error) => {
        showError(extractApiErrorMessage(error, "Não foi possível carregar as sections da tab."));
      });
  }, [selectedTabId, taskDestinationResult, showError]);

  const refreshCurrentSearch = async () => {
    await performSearch(query);
  };

  const resultStats = useMemo(
    () => ({
      tabs: results.filter((item) => item.type === "TAB").length,
      sections: results.filter((item) => item.type === "SECTION").length,
      tasks: results.filter((item) => item.type === "TASK").length,
    }),
    [results],
  );

  const handleRestoreTab = async () => {
    if (!pendingTabRestore) return;

    try {
      await restoreArchivedTab(pendingTabRestore.id);
      setPendingTabRestore(null);
      setSelectedTaskResult(null);
      await refreshCurrentSearch();
      showSuccess("Tab desarquivada com sucesso.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível desarquivar a tab."));
    }
  };

  const handleRestoreSectionWithParents = async () => {
    if (!pendingSectionRestoreWithParents) return;

    try {
      await restoreArchivedSection(pendingSectionRestoreWithParents.id, { restoreParents: true });
      setPendingSectionRestoreWithParents(null);
      await refreshCurrentSearch();
      showSuccess("Section desarquivada com os pais.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível desarquivar a section."));
    }
  };

  const handleRestoreTaskWithParents = async () => {
    if (!pendingTaskRestoreWithParents) return;

    try {
      await restoreArchivedTask(pendingTaskRestoreWithParents.id, { restoreParents: true });
      setPendingTaskRestoreWithParents(null);
      setSelectedTaskResult(null);
      await refreshCurrentSearch();
      showSuccess("Task desarquivada com os pais.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível desarquivar a task."));
    }
  };

  const handleRestoreSectionToDestination = async () => {
    if (!sectionDestinationResult || !selectedTabId) return;

    try {
      await restoreArchivedSection(sectionDestinationResult.id, { targetTabId: selectedTabId });
      setSectionDestinationResult(null);
      await refreshCurrentSearch();
      showSuccess("Section desarquivada no destino escolhido.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível restaurar a section."));
    }
  };

  const handleRestoreTaskToDestination = async () => {
    if (!taskDestinationResult || !selectedTabId || !selectedSectionId) return;

    try {
      await restoreArchivedTask(taskDestinationResult.id, {
        targetTabId: selectedTabId,
        targetSectionId: selectedSectionId,
      });
      setTaskDestinationResult(null);
      setSelectedTaskResult(null);
      await refreshCurrentSearch();
      showSuccess("Task desarquivada no destino escolhido.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível restaurar a task."));
    }
  };

  const renderTabPreview = (result: ArchivedSearchResult) => {
    if (!result.tab?.sections?.length) return null;

    return (
      <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        {result.tab.sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{section.name}</p>
                <p className="text-xs text-gray-500">{section.tasks.length} task(s)</p>
              </div>
              <div className="flex gap-2">
                {result.parentTabArchived ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingSectionRestoreWithParents({
                        ...result,
                        id: section.id,
                        title: section.name,
                        type: "SECTION",
                        section,
                      });
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Desarquivar pais
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSectionDestinationResult({
                      ...result,
                      id: section.id,
                      title: section.name,
                      type: "SECTION",
                      section,
                    });
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Escolher tab
                </button>
              </div>
            </div>
            {section.tasks.length > 0 ? (
              <div className="mt-3 space-y-2">
                {section.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                  >
                    <span className="text-sm text-gray-700">{task.title}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (result.parentTabArchived || section.archived) {
                          setPendingTaskRestoreWithParents({
                            ...result,
                            id: task.id,
                            title: task.title,
                            type: "TASK",
                            task,
                            parentSectionId: section.id,
                            parentSectionName: section.name,
                            parentSectionArchived: Boolean(section.archived),
                          });
                        } else {
                          setTaskDestinationResult({
                            ...result,
                            id: task.id,
                            title: task.title,
                            type: "TASK",
                            task,
                            parentSectionId: section.id,
                            parentSectionName: section.name,
                            parentSectionArchived: Boolean(section.archived),
                          });
                        }
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Desarquivar
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionPreview = (result: ArchivedSearchResult) => {
    if (!result.section) return null;

    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {result.parentTabArchived ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setPendingSectionRestoreWithParents(result);
              }}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Desarquivar pais juntos
            </button>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSectionDestinationResult(result);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Escolher tab de destino
          </button>
        </div>

        {result.section.tasks.length > 0 ? (
          <div className="mt-4 space-y-2">
            {result.section.tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {task.title}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderTaskPreview = (result: ArchivedSearchResult) => {
    if (!result.task) return null;

    const hasArchivedParents = Boolean(result.parentTabArchived || result.parentSectionArchived);

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedTaskResult(result);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Ver detalhes
        </button>
        {hasArchivedParents ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPendingTaskRestoreWithParents(result);
            }}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Desarquivar pais juntos
          </button>
        ) : (
          <button
            type="button"
            onClick={async (event) => {
              event.stopPropagation();
              try {
                await restoreArchivedTask(result.id);
                await refreshCurrentSearch();
                showSuccess("Task desarquivada com sucesso.");
              } catch (error) {
                showError(extractApiErrorMessage(error, "Não foi possível desarquivar a task."));
              }
            }}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Desarquivar task
          </button>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setTaskDestinationResult(result);
            setSelectedTaskResult(result);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Escolher destino
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">Arquivados</h1>
        <p className="mt-2 text-sm text-gray-500">
          Busque e restaure tabs, sections e tasks arquivadas.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tabs, sections, tasks, comentários e subtarefas arquivadas..."
            className="w-full text-sm outline-none"
          />
        </div>

        {query.trim().length < 2 ? (
          <p className="pt-3 text-sm text-gray-500">
            Digite pelo menos 2 caracteres para buscar em itens arquivados.
          </p>
        ) : isSearching ? (
          <p className="pt-3 text-sm text-gray-500">Buscando itens arquivados...</p>
        ) : (
          <div className="pt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{results.length} item(ns) arquivado(s)</span>
              <span>{resultStats.tabs} tabs</span>
              <span>{resultStats.sections} sections</span>
              <span>{resultStats.tasks} tasks</span>
            </div>

            {results.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                <Archive className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">Nenhum item arquivado.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {results.map((result) => (
                  <article key={`${result.type}-${result.id}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-purple-700">
                            {result.type}
                          </span>
                          {result.parentTabArchived ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700">
                              <FolderArchive className="h-3 w-3" />
                              Aba arquivada
                            </span>
                          ) : null}
                          {result.parentSectionArchived ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                              <Archive className="h-3 w-3" />
                              Section arquivada
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-gray-950">{result.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{result.subtitle}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          {result.parentTabName ?? "Sem aba"} / {result.parentSectionName ?? "Sem section"}
                        </p>
                      </div>

                      <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        score {result.score}
                      </div>
                    </div>

                    {result.matches.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {result.matches.slice(0, 4).map((match) => (
                          <div key={`${result.type}-${result.id}-${match.field}-${match.snippet}`} className="rounded-xl bg-gray-50 px-3 py-2">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {match.label}
                            </p>
                            <HighlightedSnippet
                              snippet={match.snippet}
                              matchedTerms={match.matchedTerms}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {result.type === "TAB" ? renderTabPreview(result) : null}
                    {result.type === "SECTION" ? renderSectionPreview(result) : null}
                    {result.type === "TASK" ? renderTaskPreview(result) : null}

                    {result.type === "TAB" ? (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setPendingTabRestore(result)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Desarquivar tab inteira
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {selectedTaskResult ? (
        <ArchivedTaskModal
          result={selectedTaskResult}
          onClose={() => setSelectedTaskResult(null)}
          onRestore={() => setPendingTaskRestoreWithParents(selectedTaskResult)}
          onMove={() => setTaskDestinationResult(selectedTaskResult)}
        />
      ) : null}

      <ConfirmModal
        isOpen={pendingTabRestore !== null}
        onConfirm={() => void handleRestoreTab()}
        onCancel={() => setPendingTabRestore(null)}
        title="Desarquivar tab?"
        message={
          pendingTabRestore
            ? `A tab "${pendingTabRestore.title}" voltará a aparecer na área principal.`
            : undefined
        }
      />

      <ConfirmModal
        isOpen={pendingSectionRestoreWithParents !== null}
        onConfirm={() => void handleRestoreSectionWithParents()}
        onCancel={() => setPendingSectionRestoreWithParents(null)}
        title="Desarquivar pais juntos?"
        message={
          pendingSectionRestoreWithParents
            ? `A section "${pendingSectionRestoreWithParents.title}" será restaurada junto com a hierarquia pai necessária.`
            : undefined
        }
      />

      <ConfirmModal
        isOpen={pendingTaskRestoreWithParents !== null}
        onConfirm={() => void handleRestoreTaskWithParents()}
        onCancel={() => setPendingTaskRestoreWithParents(null)}
        title="Desarquivar pais juntos?"
        message={
          pendingTaskRestoreWithParents
            ? `A task "${pendingTaskRestoreWithParents.title}" será restaurada junto com os pais necessários.`
            : undefined
        }
      />

      {sectionDestinationResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Escolher tab de destino</h3>
            <p className="mt-2 text-sm text-gray-500">
              Selecione a tab ativa para reinserir a section e as tasks dela.
            </p>

            <select
              value={selectedTabId}
              onChange={(event) => setSelectedTabId(event.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {activeTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSectionDestinationResult(null)}
                className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleRestoreSectionToDestination()}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Restaurar section
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {taskDestinationResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Escolher destino da task</h3>
            <p className="mt-2 text-sm text-gray-500">
              Selecione a tab e a section ativas para onde a task deve voltar.
            </p>

            <select
              value={selectedTabId}
              onChange={(event) => setSelectedTabId(event.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {activeTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskDestinationResult(null)}
                className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleRestoreTaskToDestination()}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Restaurar task
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FilesPlaceholder() {
  const [activeSection, setActiveSection] = useState<FilesSection>("archived");

  const activeItem = menuItems.find((item) => item.id === activeSection) ?? menuItems[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                    isActive
                      ? "border-l-4 border-l-purple-600 bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="truncate text-xs text-gray-400">{item.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          {activeSection === "archived" ? (
            <ArchivedContent />
          ) : (
            <DevelopmentPlaceholder
              title={activeItem.title}
              subtitle={activeItem.subtitle}
            />
          )}
        </section>
      </div>
    </div>
  );
}
