import { Archive, FolderArchive, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { CollapseProvider } from "../context/CollapseContext";
import { searchTasks, unarchiveTask } from "../services/TaskService";
import { TaskSearchResult } from "../types/TaskSearch";
import { splitHighlightedText } from "../utils/highlightSearchText";
import { TaskCard } from "./TaskCard";

interface TaskSearchPanelProps {
    tabId: string | null;
    scope?: "active" | "archived" | "all";
    placeholder?: string;
    helperMessage?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    modalDescription?: string;
}

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function TaskSearchPanel({
    tabId,
    scope = "active",
    placeholder = "Buscar por título, descrição, Jira ID, ID, comentários ou subtarefas...",
    helperMessage = `Digite pelo menos ${MIN_QUERY_LENGTH} caracteres para buscar.`,
    emptyMessage = "Nenhuma task encontrada para essa busca.",
    loadingMessage = "Buscando tasks...",
    modalDescription = "Visualizando a task original correspondente ao resultado da busca.",
}: TaskSearchPanelProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TaskSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] =
        useState<TaskSearchResult | null>(null);
    const [isConfirmingUnarchive, setIsConfirmingUnarchive] = useState(false);
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        if (query.trim().length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchTasks(query, tabId ?? undefined, scope);
                setResults(data);
            } catch (error) {
                showError(
                    extractApiErrorMessage(
                        error,
                        "Não foi possível buscar as tasks.",
                    ),
                );
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [query, scope, showError, tabId]);

    const selectedTask = selectedResult?.task ?? null;
    const selectedHighlightTerms = selectedResult
        ? Array.from(
              new Set(
                  selectedResult.matches.flatMap((match) => match.matchedTerms),
              ),
          )
        : [];

    const handleConfirmUnarchive = async () => {
        if (!selectedResult) {
            return;
        }

        try {
            await unarchiveTask(selectedResult.task.id);
            setResults((previous) =>
                previous.filter((result) => result.task.id !== selectedResult.task.id),
            );
            setSelectedResult(null);
            showSuccess("Task desarquivada com sucesso.");
        } catch (error) {
            showError(
                extractApiErrorMessage(
                    error,
                    "Não foi possível desarquivar a task.",
                ),
            );
        } finally {
            setIsConfirmingUnarchive(false);
        }
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    className="w-full text-sm outline-none"
                />
            </div>

            {query.trim().length < MIN_QUERY_LENGTH ? (
                <p className="pt-3 text-sm text-gray-500">{helperMessage}</p>
            ) : isSearching ? (
                <p className="pt-3 text-sm text-gray-500">{loadingMessage}</p>
            ) : results.length === 0 ? (
                <p className="pt-3 text-sm text-gray-500">{emptyMessage}</p>
            ) : (
                <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                        {results.length} resultado(s) encontrado(s)
                    </p>
                    {results.map((result) => (
                        <article
                            key={result.task.id}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedResult(result)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedResult(result)
                                        }
                                        className="text-left text-base font-semibold text-gray-900 transition hover:text-purple-700"
                                    >
                                        {result.task.title}
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        {result.tabName ?? "Sem aba"} /{" "}
                                        {result.sectionName ?? "Sem section"}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {result.tabArchived ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700">
                                                <FolderArchive className="h-3 w-3" />
                                                Aba arquivada
                                            </span>
                                        ) : null}
                                        {result.sectionArchived ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                                                <Archive className="h-3 w-3" />
                                                Section arquivada
                                            </span>
                                        ) : null}
                                        {result.task.archived ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-[11px] font-medium text-purple-700">
                                                <Archive className="h-3 w-3" />
                                                Task arquivada
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                    score {result.score}
                                </span>
                            </div>

                            <div className="mt-3 space-y-2">
                                {result.matches.map((match) => (
                                    <button
                                        key={`${result.task.id}-${match.field}`}
                                        type="button"
                                        onClick={() =>
                                            setSelectedResult(result)
                                        }
                                        className="block w-full rounded-lg bg-white px-3 py-2 text-left transition hover:bg-yellow-50"
                                    >
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            {match.label}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {splitHighlightedText(
                                                match.snippet,
                                                match.matchedTerms,
                                            ).map((part, index) =>
                                                part.highlighted ? (
                                                    <mark
                                                        key={index}
                                                        className="rounded bg-yellow-200 px-0.5 text-gray-900"
                                                    >
                                                        {part.text}
                                                    </mark>
                                                ) : (
                                                    <span key={index}>
                                                        {part.text}
                                                    </span>
                                                ),
                                            )}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selectedTask ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                    <div className="relative max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSelectedResult(null)}
                            aria-label="Fechar task"
                            className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="pr-12">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <p className="text-sm font-medium text-gray-500">
                                    {modalDescription}
                                </p>
                                {selectedTask.archived ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingUnarchive(true)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Desarquivar
                                    </button>
                                ) : null}
                            </div>
                            <CollapseProvider initialExpanded>
                                <TaskCard
                                    task={selectedTask}
                                    readOnly
                                    highlightTerms={selectedHighlightTerms}
                                    onToggleComplete={() => undefined}
                                    onDelete={() => undefined}
                                    onUpdateTask={(updatedTask) =>
                                        setSelectedResult((current) =>
                                            current
                                                ? {
                                                      ...current,
                                                      task: updatedTask,
                                                  }
                                                : current,
                                        )
                                    }
                                />
                            </CollapseProvider>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmModal
                isOpen={isConfirmingUnarchive}
                onConfirm={() => void handleConfirmUnarchive()}
                onCancel={() => setIsConfirmingUnarchive(false)}
                title="Desarquivar task?"
                message={
                    selectedTask
                        ? `A task "${selectedTask.title}" voltará a aparecer na área principal.`
                        : undefined
                }
            />
        </section>
    );
}
