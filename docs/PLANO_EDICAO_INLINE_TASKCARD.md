# Plano: Edição Inline no TaskCard

## Contexto Atual

- **TaskEditModal** (`src/features/tasks/components/TaskEditModal.tsx`): modal com título, descrição, Jira ID, categoria e checkbox "Concluído"
- **TaskList** (`src/features/tasks/components/TaskList.tsx`): mantém `taskToEdit` e renderiza `TaskEditModal` ao clicar em editar
- **TaskCard** (`src/features/tasks/components/TaskCard.tsx`): exibe task em modo leitura; botão de edição chama `onEdit`
- **TaskDraggableCard**: repassa `onEdit` para o `TaskCard`

---

## 1. Remover TaskEditModal

- Excluir o arquivo `src/features/tasks/components/TaskEditModal.tsx`
- Em `TaskList.tsx`:
  - Remover import de `TaskEditModal`
  - Remover estado `taskToEdit` e `isModalOpen`
  - Remover `handleEditTask`
  - Remover o bloco de renderização do modal
  - Ajustar `onEdit` — o card passará a controlar o modo edição internamente

---

## 2. Edição Inline no TaskCard

### 2.1 Estados e fluxo

- **Modo leitura** (padrão): título e descrição como texto; botões de ação (editar, excluir)
- **Modo edição**: título e descrição como inputs; botões Salvar e Cancelar

O `TaskCard` passa a controlar internamente o modo de edição e a chamada à API.

### 2.2 Alterações no TaskCard

- Estado local: `isEditing` (boolean)
- Ao clicar em editar: `setIsEditing(true)`
- Campos em modo edição:
  - **Título**: `input` com valor inicial `task.title`
  - **Descrição**: `textarea` com valor inicial `task.description`
- Estados de edição: `editTitle`, `editDescription` (inicializados com `task.title` e `task.description` ao entrar em edição)
- **Salvar**: chamar `updateTask` com `title`, `description`, `completed: task.completed`, `jiraId`, `categoryId`; em seguida `onUpdateTask` e `setIsEditing(false)`
- **Cancelar**: restaurar valores originais e `setIsEditing(false)`

### 2.3 Estilo conforme protótipo

- **Modo edição**: borda esquerda verde (`border-l-4`, `border-green-500`)
- **Botão Salvar**: fundo verde, ícone de check, texto "Salvar"
- **Botão Cancelar**: fundo branco, borda cinza, ícone "x", texto "Cancelar"
- Inputs com borda cinza clara e cantos arredondados

### 2.4 Props do TaskCard

- Manter: `task`, `onToggleComplete`, `onDelete`, `onUpdateTask`
- Alterar `onEdit`: pode ser removido; o card usa botão interno que chama `setIsEditing(true)`
- Adicionar `onSaved?: () => void` para recarregar a lista após salvar (opcional)

---

## 3. Ajustes no TaskList e TaskDraggableCard

- **TaskList**: remover lógica do modal; `onEdit` continua sendo passado, mas o `TaskCard` passa a tratar a edição internamente
- **TaskDraggableCard**: manter `onEdit` se ainda for usado; caso contrário, o `TaskCard` pode receber apenas `onUpdateTask` e `onTasksUpdated` para refresh

Fluxo: `TaskCard` recebe `onUpdateTask` e, ao salvar, chama `onUpdateTask(updatedTask)` com os dados atualizados.

---

## 4. API updateTask

O `updateTask` exige `title`, `description`, `completed`. Para edição inline de título/descrição:

- `title`: valor do input
- `description`: valor do textarea
- `completed`: `task.completed` (mantido)
- `jiraId`: `task.jiraId ?? undefined`
- `categoryId`: `task.category?.id ?? undefined`

---

## 5. Ordem de implementação

1. Implementar modo edição inline no `TaskCard` (estados, inputs, botões Salvar/Cancelar, chamada a `updateTask`)
2. Remover `TaskEditModal` e sua lógica em `TaskList`
3. Ajustar `TaskDraggableCard` se necessário (remover `onEdit` se não for mais usado)
4. Testar fluxo completo

---

## 6. Resumo de arquivos

| Ação | Arquivo |
|------|---------|
| Excluir | `src/features/tasks/components/TaskEditModal.tsx` |
| Modificar | `src/features/tasks/components/TaskCard.tsx` — adicionar modo edição inline |
| Modificar | `src/features/tasks/components/TaskList.tsx` — remover modal e estado relacionado |
| Verificar | `src/features/tasks/components/TaskDraggableCard.tsx` — manter ou simplificar props |
