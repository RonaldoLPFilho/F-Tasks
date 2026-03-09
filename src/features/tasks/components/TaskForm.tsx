import { createTask } from "../services/TaskService";
import { useEffect, useState } from "react";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";
import { Category } from "../../../types/Category";
import { getAllCategories } from "../../settings/categories/CategoryService";
import { FilePenLine } from "lucide-react";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

interface Props {
  tabId: string | null;
  onTaskCreated: () => void;
}

export function TaskForm({ tabId, onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jiraId, setJiraId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch((err) => console.error("Erro ao carregar categorias", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabId) return;

    try {
      await createTask({
        title,
        description: description || undefined,
        tabId,
        categoryId: categoryId || undefined,
        jiraId: jiraId || undefined,
      });
      setTitle("");
      setDescription("");
      setCategoryId("");
      setJiraId("");
      onTaskCreated();
      showSuccess("Task criada com sucesso.");
    } catch (err) {
      console.error(err);
      showError(extractApiErrorMessage(err, "Não foi possível criar a task."));
    }
  }; 

    const categoryOptions = categories.map((cat) => ({
        label: cat.name,
        value: cat.id, 
    }));

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 mb-4 shadow-md"
        >
            <h1 className="text-xl font-semibold flex items-center justify-center gap-2 text-purple-700 mb-4">
                <FilePenLine className="w-5 h-5" />
                Criar tarefa
            </h1>
            
            <FloatingLabelInput
                id="titulo"
                label="Titulo"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <br/>
            <FloatingLabelInput
                id="descricao"
                label="Descrição"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                    <FloatingLabelInput
                        id="jira"
                        label="Jira ID"
                        type="text"
                        value={jiraId}
                        onChange={(e) => setJiraId(e.target.value)}
                    />
                </div>

                <div className="w-full sm:w-1/2">
                    <FloatingLabelSelect
                        id="categoria"
                        label="Categoria"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        options={categoryOptions}
                    />
                </div>
            </div>

            <br />
            <button
              type="submit"
              disabled={!tabId}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-semibold"
            >
              Criar
            </button>
        </form>
    )
}