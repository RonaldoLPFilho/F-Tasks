import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clipboard,
  LockKeyhole,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Vault,
  X,
} from "lucide-react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import {
  createVaultItem,
  deleteVaultItem,
  getVaultItems,
  unlockVault,
  updateVaultItem,
} from "../services/VaultService";
import { clearVaultSession, readVaultSession, saveVaultSession } from "../storage/vaultStorage";
import { VaultEntry, VaultItem, VaultItemPayload } from "../types/VaultItem";
import { VaultUnlockModal } from "./VaultUnlockModal";

interface VaultFormState {
  id?: string;
  name: string;
  description: string;
  entries: VaultEntry[];
}

const emptyForm: VaultFormState = {
  name: "",
  description: "",
  entries: [{ key: "", value: "" }],
};

const toFormState = (item: VaultItem): VaultFormState => ({
  id: item.id,
  name: item.name,
  description: item.description ?? "",
  entries: item.entries.length > 0 ? item.entries : [{ key: "", value: "" }],
});

const toPayload = (form: VaultFormState): VaultItemPayload => ({
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  entries: form.entries
    .map((entry) => ({
      key: entry.key.trim(),
      value: entry.value,
    }))
    .filter((entry) => entry.key || entry.value),
});

const entryId = (itemId: string, index: number) => `${itemId}-${index}`;

export function VaultContent({ onCancelUnlock }: { onCancelUnlock: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<VaultFormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showError, showSuccess } = useToast();

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const loadItems = useCallback(async (vaultToken: string) => {
    setLoading(true);
    try {
      const data = await getVaultItems(vaultToken);
      setItems(data);
      setSelectedItemId((current) => current ?? data[0]?.id ?? null);
      return true;
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível carregar o cofre."));
      clearVaultSession();
      setToken(null);
      setExpiresAt(null);
      setItems([]);
      setSelectedItemId(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const savedSession = readVaultSession();
    if (!savedSession) {
      return;
    }

    setToken(savedSession.token);
    setExpiresAt(savedSession.expiresAt ?? null);
    void loadItems(savedSession.token);
  }, [loadItems]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const expiresInMs = Date.parse(expiresAt) - Date.now();
    if (expiresInMs <= 0) {
      clearVaultSession();
      setToken(null);
      setExpiresAt(null);
      setItems([]);
      setSelectedItemId(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearVaultSession();
      setToken(null);
      setExpiresAt(null);
      setItems([]);
      setSelectedItemId(null);
      setViewingItem(null);
      setSearchQuery("");
    }, expiresInMs);

    return () => window.clearTimeout(timeoutId);
  }, [expiresAt]);

  useEffect(() => {
    if (selectedItem) {
      setForm(toFormState(selectedItem));
    } else {
      setForm(emptyForm);
    }
  }, [selectedItem]);

  const handleUnlock = async (password: string) => {
    try {
      const data = await unlockVault(password);
      setToken(data.token);
      setExpiresAt(data.expiresAt ?? null);
      saveVaultSession({ token: data.token, expiresAt: data.expiresAt });
      await loadItems(data.token);
      showSuccess("Cofre desbloqueado.");
      return true;
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível desbloquear o cofre."));
      return false;
    }
  };

  const handleNewItem = () => {
    setSelectedItemId(null);
    setForm(emptyForm);
  };

  const updateEntry = (index: number, field: keyof VaultEntry, value: string) => {
    setForm((current) => ({
      ...current,
      entries: current.entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addEntry = () => {
    setForm((current) => ({
      ...current,
      entries: [...current.entries, { key: "", value: "" }],
    }));
  };

  const removeEntry = (index: number) => {
    setForm((current) => ({
      ...current,
      entries:
        current.entries.length === 1
          ? [{ key: "", value: "" }]
          : current.entries.filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const handleSave = async () => {
    if (!token) return;

    const payload = toPayload(form);
    if (!payload.name) {
      showError("Informe um nome para o item.");
      return;
    }
    if (payload.entries.length === 0) {
      showError("Adicione pelo menos um par de chave e valor.");
      return;
    }

    setSaving(true);
    try {
      const saved = form.id
        ? await updateVaultItem(token, form.id, payload)
        : await createVaultItem(token, payload);

      setItems((current) => {
        if (!form.id) return [saved, ...current];
        return current.map((item) => (item.id === saved.id ? saved : item));
      });
      setSelectedItemId(saved.id);
      showSuccess(form.id ? "Item atualizado." : "Item criado.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível salvar o item."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !pendingDelete) return;

    try {
      await deleteVaultItem(token, pendingDelete.id);
      setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
      if (selectedItemId === pendingDelete.id) {
        setSelectedItemId(null);
      }
      if (viewingItem?.id === pendingDelete.id) {
        setViewingItem(null);
      }
      setPendingDelete(null);
      showSuccess("Item removido.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível remover o item."));
    }
  };

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess("Valor copiado.");
    } catch {
      showError("Não foi possível copiar o valor.");
    }
  };

  return (
    <div className="space-y-6">
      <VaultUnlockModal isOpen={!token} onUnlock={handleUnlock} onCancel={onCancelUnlock} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">Cofre</h1>
          <p className="mt-2 text-sm text-gray-500">Credenciais e dados sensíveis protegidos.</p>
          {expiresAt ? (
            <p className="mt-1 text-xs text-gray-400">
              Sessão expira em {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(expiresAt))}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {token ? (
            <button
              type="button"
              onClick={() => {
                setToken(null);
                setExpiresAt(null);
                setItems([]);
                setSelectedItemId(null);
                setViewingItem(null);
                setSearchQuery("");
                clearVaultSession();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <LockKeyhole className="h-4 w-4" />
              Bloquear
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleNewItem}
            disabled={!token}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Novo item
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-950">
                {form.id ? "Editar item" : "Novo item"}
              </h2>
            </div>
            {selectedItem ? (
              <button
                type="button"
                onClick={() => setPendingDelete(selectedItem)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            ) : null}
          </div>

          <div className="grid gap-3">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome"
              disabled={!token}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Descrição"
              disabled={!token}
              rows={2}
              className="resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
            />
          </div>

          <div className="mt-5 space-y-3">
            {form.entries.map((entry, index) => {
              const id = entryId(form.id ?? "draft", index);

              return (
                <div key={id} className="grid gap-2 rounded-xl border border-gray-200 p-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] md:items-center">
                  <input
                    value={entry.key}
                    onChange={(event) => updateEntry(index, "key", event.target.value)}
                    placeholder="Chave"
                    disabled={!token}
                    className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  />
                  <div className="min-w-0 rounded-lg border border-gray-200 px-3 py-2">
                    <textarea
                      value={entry.value}
                      onChange={(event) => updateEntry(index, "value", event.target.value)}
                      placeholder="Valor"
                      disabled={!token}
                      rows={2}
                      className="w-full resize-none text-sm text-gray-900 outline-none disabled:bg-gray-50"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void copyValue(entry.value)}
                      disabled={!token || !entry.value}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Copiar valor"
                      title="Copiar"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      disabled={!token}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      aria-label="Remover par"
                      title="Remover"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={addEntry}
              disabled={!token}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar par
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!token || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </section>

        <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Itens do cofre</h2>
              <p className="text-sm text-gray-500">
                {filteredItems.length} de {items.length} item(ns)
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nome"
                disabled={!token}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {!token ? (
            <div className="px-4 py-10 text-center">
              <Vault className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Desbloqueie para listar os itens.</p>
            </div>
          ) : loading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Carregando itens...</p>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Vault className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Nenhum item salvo.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Search className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Nenhum item encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const isActive = item.id === selectedItemId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setViewingItem(item)}
                    className={`min-w-0 rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-950">{item.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {item.description || "Sem descrição"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {item.entries.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
        title="Remover item do cofre?"
        message={pendingDelete ? `O item "${pendingDelete.name}" será removido permanentemente.` : undefined}
      />

      {viewingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-gray-950">{viewingItem.name}</h3>
                {viewingItem.description ? (
                  <p className="mt-1 text-sm text-gray-500">{viewingItem.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50"
                aria-label="Fechar"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <div className="grid gap-3">
                {viewingItem.entries.map((entry, index) => (
                  <div
                    key={entryId(viewingItem.id, index)}
                    className="grid gap-2 rounded-xl border border-gray-200 p-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] md:items-start"
                  >
                    <p className="break-words text-sm font-semibold text-gray-800">{entry.key}</p>
                    <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
                      {entry.value || "Sem valor"}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyValue(entry.value)}
                      disabled={!entry.value}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      aria-label={`Copiar ${entry.key}`}
                      title="Copiar"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedItemId(viewingItem.id);
                  setViewingItem(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
