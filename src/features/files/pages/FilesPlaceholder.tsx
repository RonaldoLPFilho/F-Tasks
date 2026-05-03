import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Archive,
  ArrowRightLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileArchive,
  FileText,
  FileUp,
  FolderArchive,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Vault,
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
  getArchivedItems,
  restoreArchivedSection,
  restoreArchivedTab,
  restoreArchivedTask,
} from "../services/ArchiveService";
import {
  deleteStoredFile,
  downloadStoredFile,
  getStoredFiles,
  uploadStoredFile,
} from "../services/FileService";
import { ArchivedItemsPage, ArchivedSearchResult } from "../types/ArchivedItem";
import { StoredFile, StoredFilesPage } from "../types/StoredFile";
import { VaultContent } from "../../vault/components/VaultContent";
import {
  createHowToDoDocument,
  deleteHowToDoDocument,
  getHowToDoDocument,
  getHowToDoDocuments,
  updateHowToDoDocument,
} from "../../howtodo/services/HowToDoService";
import { HowToDoDetail, HowToDoPage, HowToDoSummary } from "../../howtodo/types/HowToDoDocument";

type FilesSection = "archived" | "files" | "keyValue" | "howTo";

const ARCHIVED_PAGE_SIZE = 10;
const FILES_PAGE_SIZE = 10;

const emptyArchivedPage: ArchivedItemsPage = {
  content: [],
  page: 0,
  size: ARCHIVED_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

const emptyStoredFilesPage: StoredFilesPage = {
  content: [],
  page: 0,
  size: FILES_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

const emptyHowToDoPage: HowToDoPage = {
  content: [],
  page: 0,
  size: FILES_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

const menuItems: Array<{
  id: FilesSection;
  title: string;
  subtitle: string;
  icon: typeof Archive;
}> = [
  { id: "archived", title: "Arquivados", subtitle: "Tabs, sections e tasks", icon: Archive },
  { id: "files", title: "Arquivos", subtitle: "Anexos e documentos", icon: FileArchive },
  { id: "keyValue", title: "Cofre", subtitle: "Credenciais e dados", icon: Vault },
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

function formatBytes(sizeBytes: number) {
  if (sizeBytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(sizeBytes) / Math.log(1024)), units.length - 1);
  const value = sizeBytes / Math.pow(1024, exponent);

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StoredFilesContent() {
  const [name, setName] = useState("");
  const [uploadedFrom, setUploadedFrom] = useState("");
  const [uploadedTo, setUploadedTo] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filesPage, setFilesPage] = useState<StoredFilesPage>(emptyStoredFilesPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);
  const { showError, showSuccess } = useToast();

  const loadFiles = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getStoredFiles({
        name,
        uploadedFrom,
        uploadedTo,
        page,
        size: FILES_PAGE_SIZE,
      });
      setFilesPage(data);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível carregar os arquivos."));
      setFilesPage(emptyStoredFilesPage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFiles(currentPage);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [name, uploadedFrom, uploadedTo, currentPage]);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadStoredFile(file);
      setCurrentPage(0);
      await loadFiles(0);
      showSuccess("Arquivo enviado com sucesso.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível enviar o arquivo."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteStoredFile(pendingDelete.id);
      setPendingDelete(null);
      const nextPage = filesPage.content.length === 1 ? Math.max(currentPage - 1, 0) : currentPage;
      setCurrentPage(nextPage);
      await loadFiles(nextPage);
      showSuccess("Arquivo removido com sucesso.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível remover o arquivo."));
    }
  };

  const clearFilters = () => {
    setName("");
    setUploadedFrom("");
    setUploadedTo("");
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">Arquivos</h1>
          <p className="mt-2 text-sm text-gray-500">Anexos e documentos salvos.</p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
          <Upload className="h-4 w-4" />
          {isUploading ? "Enviando..." : "Enviar arquivo"}
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              void handleUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setCurrentPage(0);
              }}
              placeholder="Buscar por nome do arquivo"
              className="w-full text-sm outline-none"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={uploadedFrom}
              onChange={(event) => {
                setUploadedFrom(event.target.value);
                setCurrentPage(0);
              }}
              className="min-w-0 flex-1 outline-none"
              aria-label="Data inicial"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={uploadedTo}
              onChange={(event) => {
                setUploadedTo(event.target.value);
                setCurrentPage(0);
              }}
              className="min-w-0 flex-1 outline-none"
              aria-label="Data final"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Limpar
          </button>
        </div>

        <div className="pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{filesPage.totalElements} arquivo(s)</span>
            {filesPage.totalPages > 0 ? (
              <span>
                Página {filesPage.page + 1} de {filesPage.totalPages}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <p className="pt-4 text-sm text-gray-500">Carregando arquivos...</p>
          ) : filesPage.content.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <FileUp className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Nenhum arquivo encontrado.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
              <div className="hidden grid-cols-[minmax(0,1fr)_120px_170px_112px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                <span>Arquivo</span>
                <span>Tamanho</span>
                <span>Envio</span>
                <span className="text-right">Ações</span>
              </div>

              <div className="divide-y divide-gray-100 bg-white">
                {filesPage.content.map((file) => (
                  <article
                    key={file.id}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_120px_170px_112px] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{file.originalFileName}</p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {file.contentType || "application/octet-stream"} · {file.checksumSha256.slice(0, 12)}
                      </p>
                    </div>

                    <span className="text-sm text-gray-600">{formatBytes(file.sizeBytes)}</span>
                    <span className="text-sm text-gray-600">{formatDateTime(file.uploadedAt)}</span>

                    <div className="flex justify-start gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          downloadStoredFile(file).catch((error) => {
                            showError(extractApiErrorMessage(error, "Não foi possível baixar o arquivo."));
                          });
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
                        aria-label={`Baixar ${file.originalFileName}`}
                        title="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingDelete(file)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                        aria-label={`Remover ${file.originalFileName}`}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {filesPage.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                disabled={filesPage.first}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={filesPage.last}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
        title="Remover arquivo?"
        message={
          pendingDelete
            ? `O arquivo "${pendingDelete.originalFileName}" será removido do banco e do HD.`
            : undefined
        }
      />
    </div>
  );
}

function HowToDoModal({
  document,
  isCreating,
  initialEditing,
  onClose,
  onSaved,
  onDelete,
}: {
  document: HowToDoDetail | null;
  isCreating: boolean;
  initialEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDelete: (document: HowToDoDetail) => void;
}) {
  const [isEditing, setIsEditing] = useState(isCreating || initialEditing);
  const [title, setTitle] = useState(document?.title ?? "");
  const [content, setContent] = useState(document?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    setIsEditing(isCreating || initialEditing);
    setTitle(document?.title ?? "");
    setContent(document?.content ?? "");
  }, [document, isCreating, initialEditing]);

  const handleSave = async () => {
    const safeTitle = title.trim();
    if (!safeTitle) {
      showError("Informe um título.");
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        await createHowToDoDocument({ title: safeTitle, content });
        showSuccess("How To Do criado com sucesso.");
        onSaved();
        onClose();
      } else if (document) {
        const updated = await updateHowToDoDocument(document.id, { title: safeTitle, content });
        setTitle(updated.title);
        setContent(updated.content);
        setIsEditing(false);
        showSuccess("How To Do salvo com sucesso.");
        onSaved();
      }
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível salvar o How To Do."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      onClose();
      return;
    }

    setTitle(document?.title ?? "");
    setContent(document?.content ?? "");
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
              How To Do
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold text-gray-950">
              {isCreating ? "Criar novo How To Do" : document?.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isCreating && !isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            ) : null}
            {!isCreating && document ? (
              <button
                type="button"
                onClick={() => onDelete(document)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isEditing ? (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Título</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={160}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Como fazer deploy"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Markdown</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="mt-2 h-[52vh] w-full resize-none rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="# Como fazer deploy&#10;&#10;1. Acessar servidor"
                />
              </label>
            </div>
          ) : (
            <article className="max-w-none text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="mb-4 text-3xl font-bold text-gray-950">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-950">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-2 mt-5 text-xl font-semibold text-gray-950">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-7 text-gray-700">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-gray-700">{children}</ol>,
                  code: ({ children }) => <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-purple-700">{children}</code>,
                  pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-white">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="mb-4 border-l-4 border-purple-300 pl-4 text-gray-600">{children}</blockquote>,
                  a: ({ href, children }) => <a href={href} className="text-purple-700 underline" target="_blank" rel="noreferrer">{children}</a>,
                }}
              >
                {content || "_Sem conteúdo._"}
              </ReactMarkdown>
            </article>
          )}
        </div>

        {isEditing ? (
          <footer className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function HowToDoContent() {
  const [title, setTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [documentsPage, setDocumentsPage] = useState<HowToDoPage>(emptyHowToDoPage);
  const [selectedDocument, setSelectedDocument] = useState<HowToDoDetail | null>(null);
  const [initialEditing, setInitialEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HowToDoSummary | HowToDoDetail | null>(null);
  const { showError, showSuccess } = useToast();

  const loadDocuments = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getHowToDoDocuments({
        title,
        page,
        size: FILES_PAGE_SIZE,
      });
      setDocumentsPage(data);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível carregar os How To Do."));
      setDocumentsPage(emptyHowToDoPage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDocuments(currentPage);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [title, currentPage]);

  const openDocument = async (documentId: string, edit = false) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getHowToDoDocument(documentId);
      setSelectedDocument(detail);
      setIsCreating(false);
      setInitialEditing(edit);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível abrir o How To Do."));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteHowToDoDocument(pendingDelete.id);
      setPendingDelete(null);
      setSelectedDocument(null);
      const nextPage = documentsPage.content.length === 1 ? Math.max(currentPage - 1, 0) : currentPage;
      setCurrentPage(nextPage);
      await loadDocuments(nextPage);
      showSuccess("How To Do removido com sucesso.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível remover o How To Do."));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">How To Do</h1>
          <p className="mt-2 text-sm text-gray-500">Guias e procedimentos em Markdown.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedDocument(null);
            setInitialEditing(false);
            setIsCreating(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Criar novo How To Do
        </button>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setCurrentPage(0);
            }}
            placeholder="Buscar por título"
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{documentsPage.totalElements} documento(s)</span>
            {documentsPage.totalPages > 0 ? (
              <span>
                Página {documentsPage.page + 1} de {documentsPage.totalPages}
              </span>
            ) : null}
            {isLoadingDetail ? <span>Carregando detalhe...</span> : null}
          </div>

          {isLoading ? (
            <p className="pt-4 text-sm text-gray-500">Carregando How To Do...</p>
          ) : documentsPage.content.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Nenhum How To Do encontrado.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
              <div className="hidden grid-cols-[minmax(0,1fr)_170px_170px_120px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                <span>Título</span>
                <span>Criado em</span>
                <span>Atualizado em</span>
                <span className="text-right">Ações</span>
              </div>

              <div className="divide-y divide-gray-100 bg-white">
                {documentsPage.content.map((document) => (
                  <article
                    key={document.id}
                    onClick={() => void openDocument(document.id)}
                    className="grid cursor-pointer gap-3 px-4 py-4 transition hover:bg-gray-50 md:grid-cols-[minmax(0,1fr)_170px_170px_120px] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{document.title}</p>
                      <p className="mt-1 truncate text-xs text-gray-400">{document.id}</p>
                    </div>

                    <span className="text-sm text-gray-600">{formatDateTime(document.createdAt)}</span>
                    <span className="text-sm text-gray-600">{formatDateTime(document.updatedAt)}</span>

                    <div className="flex justify-start gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDocument(document.id);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
                        aria-label={`Visualizar ${document.title}`}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDocument(document.id, true);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
                        aria-label={`Editar ${document.title}`}
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete(document);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                        aria-label={`Excluir ${document.title}`}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {documentsPage.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                disabled={documentsPage.first}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={documentsPage.last}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {(selectedDocument || isCreating) ? (
        <HowToDoModal
          document={selectedDocument}
          isCreating={isCreating}
          initialEditing={initialEditing}
          onClose={() => {
            setSelectedDocument(null);
            setInitialEditing(false);
            setIsCreating(false);
          }}
          onSaved={() => void loadDocuments(currentPage)}
          onDelete={(document) => setPendingDelete(document)}
        />
      ) : null}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
        title="Excluir How To Do?"
        message={
          pendingDelete
            ? `O documento "${pendingDelete.title}" será removido do sistema e do HD.`
            : undefined
        }
      />
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
  const [archivedPage, setArchivedPage] = useState<ArchivedItemsPage>(emptyArchivedPage);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
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

  const results = archivedPage.content;
  const hasSearchQuery = query.trim().length >= 2;

  const loadArchivedItems = async (value: string, page: number) => {
    setIsLoadingArchived(true);
    try {
      const data = await getArchivedItems({
        query: value,
        page,
        size: ARCHIVED_PAGE_SIZE,
      });
      setArchivedPage(data);
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível carregar os itens arquivados."));
      setArchivedPage(emptyArchivedPage);
    } finally {
      setIsLoadingArchived(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadArchivedItems(query, currentPage);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, currentPage]);

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
    await loadArchivedItems(query, currentPage);
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
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(0);
            }}
            placeholder="Buscar por tabs, sections, tasks, comentários e subtarefas arquivadas..."
            className="w-full text-sm outline-none"
          />
        </div>

        {!hasSearchQuery ? (
          <p className="pt-3 text-sm text-gray-500">
            Exibindo os últimos itens arquivados. Digite pelo menos 2 caracteres para filtrar.
          </p>
        ) : null}

        {isLoadingArchived ? (
          <p className="pt-3 text-sm text-gray-500">Carregando itens arquivados...</p>
        ) : (
          <div className="pt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{archivedPage.totalElements} item(ns) arquivado(s)</span>
              <span>{resultStats.tabs} tabs</span>
              <span>{resultStats.sections} sections</span>
              <span>{resultStats.tasks} tasks</span>
              {archivedPage.totalPages > 0 ? (
                <span>
                  Página {archivedPage.page + 1} de {archivedPage.totalPages}
                </span>
              ) : null}
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

                      {hasSearchQuery ? (
                        <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        score {result.score}
                        </div>
                      ) : null}
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

            {archivedPage.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                  disabled={archivedPage.first}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={archivedPage.last}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
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
          ) : activeSection === "files" ? (
            <StoredFilesContent />
          ) : activeSection === "keyValue" ? (
            <VaultContent onCancelUnlock={() => setActiveSection("archived")} />
          ) : activeSection === "howTo" ? (
            <HowToDoContent />
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
