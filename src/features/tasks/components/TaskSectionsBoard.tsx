import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ChevronDown, ClipboardList } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { useCollapse } from "../context/CollapseContext";
import {
  createSection,
  deleteSection,
  updateSection,
} from "../services/SectionService";
import {
  deleteTask,
  reorderTasks,
  toggleTaskCompletion,
} from "../services/TaskService";
import { Task } from "../types/Task";
import { TaskSection } from "../types/TaskSection";
import { TaskCreateSectionInline } from "./TaskCreateSectionInline";
import { TaskDragPreview } from "./TaskSortableCard";
import { TaskSectionCard } from "./TaskSectionCard";

interface TaskSectionsBoardProps {
  sections: TaskSection[];
  setSections: Dispatch<SetStateAction<TaskSection[]>>;
  tabId: string | null;
  onSectionsUpdated: () => Promise<void>;
}

const DEFAULT_SECTION_NAME = "Geral";
const MAX_SECTIONS_PER_TAB = 5;

const isDefaultSection = (section: TaskSection) =>
  section.name.trim().toLowerCase() === DEFAULT_SECTION_NAME.toLowerCase();

const getSectionIdByItemId = (sections: TaskSection[], itemId: string) => {
  const section = sections.find(
    (currentSection) =>
      currentSection.id === itemId ||
      currentSection.tasks.some((task) => task.id === itemId)
  );

  return section?.id ?? null;
};

const findTaskById = (sections: TaskSection[], taskId: string) =>
  sections.flatMap((section) => section.tasks).find((task) => task.id === taskId) ?? null;

const buildSectionUpdates = (sections: TaskSection[]) =>
  sections.map((section) => ({
    sectionId: section.id,
    orderedIds: section.tasks.map((task) => task.id),
  }));

export function TaskSectionsBoard({
  sections,
  setSections,
  tabId,
  onSectionsUpdated,
}: TaskSectionsBoardProps) {
  const [sectionToDelete, setSectionToDelete] = useState<TaskSection | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const { toggleAll, isExpanded } = useCollapse();
  const dragSnapshotRef = useRef<TaskSection[]>(sections);
  const { showSuccess, showError } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setCollapsedSections((previous) => {
      const next = { ...previous };

      sections.forEach((section) => {
        if (!(section.id in next)) {
          next[section.id] = false;
        }
      });

      Object.keys(next).forEach((sectionId) => {
        if (!sections.some((section) => section.id === sectionId)) {
          delete next[sectionId];
        }
      });

      return next;
    });

    if (!activeTaskId) {
      dragSnapshotRef.current = sections;
    }
  }, [activeTaskId, sections]);

  const activeTask = useMemo(
    () => (activeTaskId ? findTaskById(sections, activeTaskId) : null),
    [activeTaskId, sections]
  );

  const persistTaskSections = async (nextSections: TaskSection[]) => {
    if (!tabId) {
      return;
    }

    const snapshot = dragSnapshotRef.current;

    try {
      await reorderTasks(tabId, buildSectionUpdates(nextSections));
      dragSnapshotRef.current = nextSections;
    } catch (error) {
      console.error("Erro ao persistir ordenação das tasks", error);
      showError(extractApiErrorMessage(error, "Não foi possível reordenar as tasks."));
      setSections(snapshot);
    }
  };

  const updateTaskInSections = (updatedTask: Task) => {
    setSections((previous) =>
      previous.map((section) => ({
        ...section,
        tasks: section.tasks.map((task) =>
          task.id === updatedTask.id ? { ...updatedTask, sectionId: section.id } : task
        ),
      }))
    );
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await toggleTaskCompletion(task.id, !task.completed);
      setSections((previous) =>
        previous.map((section) => ({
          ...section,
          tasks: section.tasks.map((currentTask) =>
            currentTask.id === task.id
              ? { ...currentTask, completed: !currentTask.completed }
              : currentTask
          ),
        }))
      );
    } catch (error) {
      console.error("Erro ao atualizar o status da tarefa", error);
      showError(extractApiErrorMessage(error, "Não foi possível atualizar a task."));
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) {
      return;
    }

    try {
      await deleteTask(taskToDelete);
      setSections((previous) =>
        previous.map((section) => ({
          ...section,
          tasks: section.tasks.filter((task) => task.id !== taskToDelete),
        }))
      );
      showSuccess("Task removida com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir a task", error);
      showError(extractApiErrorMessage(error, "Não foi possível remover a task."));
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleCreateSection = async (name: string) => {
    if (!tabId) {
      return "Selecione uma aba para criar sections.";
    }

    if (sections.length >= MAX_SECTIONS_PER_TAB) {
      return `Máximo de ${MAX_SECTIONS_PER_TAB} sections por aba.`;
    }

    try {
      await createSection(tabId, name);
      await onSectionsUpdated();
      showSuccess("Section criada com sucesso.");
      return null;
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível criar a section."));
      return extractApiErrorMessage(error, "Não foi possível criar a section.");
    }
  };

  const handleRenameSection = async (sectionId: string, name: string) => {
    if (!tabId) {
      return "Selecione uma aba para editar sections.";
    }

    try {
      await updateSection(tabId, sectionId, name);
      await onSectionsUpdated();
      showSuccess("Section atualizada com sucesso.");
      return null;
    } catch (error) {
      showError(extractApiErrorMessage(error, "Não foi possível editar a section."));
      return extractApiErrorMessage(error, "Não foi possível editar a section.");
    }
  };

  const handleDeleteSection = async () => {
    if (!tabId || !sectionToDelete) {
      return;
    }

    try {
      await deleteSection(tabId, sectionToDelete.id);
      setSectionToDelete(null);
      await onSectionsUpdated();
      showSuccess("Section removida com sucesso.");
    } catch (error) {
      console.error("Erro ao remover a section", error);
      showError(extractApiErrorMessage(error, "Não foi possível remover a section."));
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    dragSnapshotRef.current = sections;
    setActiveTaskId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setSections((previous) => {
      const activeSectionId = getSectionIdByItemId(previous, activeId);
      const overSectionId = getSectionIdByItemId(previous, overId);

      if (!activeSectionId || !overSectionId || activeSectionId === overSectionId) {
        return previous;
      }

      const nextSections = previous.map((section) => ({
        ...section,
        tasks: [...section.tasks],
      }));

      const activeSection = nextSections.find((section) => section.id === activeSectionId);
      const overSection = nextSections.find((section) => section.id === overSectionId);

      if (!activeSection || !overSection) {
        return previous;
      }

      const activeTaskIndex = activeSection.tasks.findIndex((task) => task.id === activeId);
      if (activeTaskIndex === -1) {
        return previous;
      }

      const [movedTask] = activeSection.tasks.splice(activeTaskIndex, 1);
      const overTaskIndex = overSection.tasks.findIndex((task) => task.id === overId);
      const insertIndex =
        overId === overSectionId || overTaskIndex === -1
          ? overSection.tasks.length
          : overTaskIndex;

      overSection.tasks.splice(insertIndex, 0, {
        ...movedTask,
        sectionId: overSectionId,
      });

      return nextSections;
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);

    if (!over) {
      setSections(dragSnapshotRef.current);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    let nextSections = sections;

    setSections((previous) => {
      const activeSectionId = getSectionIdByItemId(previous, activeId);
      const overSectionId = getSectionIdByItemId(previous, overId);

      if (!activeSectionId || !overSectionId) {
        nextSections = previous;
        return previous;
      }

      const currentSection = previous.find((section) => section.id === activeSectionId);
      if (!currentSection) {
        nextSections = previous;
        return previous;
      }

      const activeTaskIndex = currentSection.tasks.findIndex((task) => task.id === activeId);
      if (activeTaskIndex === -1) {
        nextSections = previous;
        return previous;
      }

      if (activeSectionId !== overSectionId) {
        const recalculatedSections = previous.map((section) => ({
          ...section,
          tasks: [...section.tasks],
        }));

        const sourceSection = recalculatedSections.find(
          (section) => section.id === activeSectionId
        );
        const targetSection = recalculatedSections.find(
          (section) => section.id === overSectionId
        );

        if (!sourceSection || !targetSection) {
          nextSections = previous;
          return previous;
        }

        const sourceTaskIndex = sourceSection.tasks.findIndex((task) => task.id === activeId);
        if (sourceTaskIndex === -1) {
          nextSections = previous;
          return previous;
        }

        const [movedTask] = sourceSection.tasks.splice(sourceTaskIndex, 1);
        const targetTaskIndex = targetSection.tasks.findIndex((task) => task.id === overId);
        const insertIndex =
          overId === overSectionId || targetTaskIndex === -1
            ? targetSection.tasks.length
            : targetTaskIndex;

        targetSection.tasks.splice(insertIndex, 0, {
          ...movedTask,
          sectionId: overSectionId,
        });

        nextSections = recalculatedSections;
        return recalculatedSections;
      }

      const overTaskIndex = currentSection.tasks.findIndex((task) => task.id === overId);
      if (overTaskIndex === -1 || activeTaskIndex === overTaskIndex) {
        nextSections = previous;
        return previous;
      }

      nextSections = previous.map((section) =>
        section.id === activeSectionId
          ? {
              ...section,
              tasks: arrayMove(section.tasks, activeTaskIndex, overTaskIndex),
            }
          : section
      );

      return nextSections;
    });

    await persistTaskSections(nextSections);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-purple-700">
          <ClipboardList className="h-5 w-5" />
          Lista de tarefas
        </h1>

        <button
          onClick={toggleAll}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
          title={isExpanded ? "Recolher tudo" : "Expandir tudo"}
          className="flex text-xl"
        >
          <ChevronDown
            className={`h-5 w-5 text-purple-700 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveTaskId(null);
          setSections(dragSnapshotRef.current);
        }}
      >
        <div className="space-y-4">
          {sections.map((section) => (
            <TaskSectionCard
              key={section.id}
              section={section}
              isDefault={isDefaultSection(section)}
              collapsed={collapsedSections[section.id] ?? false}
              onToggleCollapse={() =>
                setCollapsedSections((previous) => ({
                  ...previous,
                  [section.id]: !previous[section.id],
                }))
              }
              onRename={handleRenameSection}
              onDelete={setSectionToDelete}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={setTaskToDelete}
              onUpdateTask={updateTaskInSections}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskDragPreview
              task={activeTask}
              onToggleComplete={() => undefined}
              onDelete={() => undefined}
              onUpdateTask={() => undefined}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskCreateSectionInline
        currentCount={sections.length}
        maxSections={MAX_SECTIONS_PER_TAB}
        onCreate={handleCreateSection}
      />

      <ConfirmModal
        isOpen={sectionToDelete !== null}
        onConfirm={handleDeleteSection}
        onCancel={() => setSectionToDelete(null)}
        title="Remover section?"
        message={
          sectionToDelete && sectionToDelete.tasks.length > 0
            ? "As tarefas desta section serão movidas para a section \"Geral\"."
            : "Esta section será removida."
        }
      />

      <ConfirmModal
        isOpen={taskToDelete !== null}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
