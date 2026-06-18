import { apiRequest } from './client';

export type Urgency = 'low' | 'moderate' | 'high';
export type Status = 'not_started' | 'in_progress' | 'done';

export interface Todo {
  id: string;
  description: string;
  date: string | null; // YYYY-MM-DD or null for backlog ("Someday") todos
  color: string;
  urgency: Urgency;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  description: string;
  date?: string | null; // YYYY-MM-DD, or null/omitted for backlog
  color?: string;
  urgency?: Urgency;
  status?: Status;
}

export type UpdateTodoInput = Partial<CreateTodoInput>;

export const getTodoById = (id: string) => {
  return apiRequest<{ todo: Todo }>(`/todos/${id}`);
};

export const getTodosByDate = (date: string) => {
  return apiRequest<{ todos: Todo[] }>(`/todos?date=${date}`);
};

export const getTodosInRange = (from: string, to: string) => {
  return apiRequest<{ todos: Todo[] }>(`/todos?from=${from}&to=${to}`);
};

export const getBacklogTodos = () => {
  return apiRequest<{ todos: Todo[] }>('/todos?backlog=true');
};

export const createTodo = (input: CreateTodoInput) => {
  return apiRequest<{ todo: Todo }>('/todos', {
    method: 'POST',
    body: input,
  });
};

export const updateTodo = (id: string, input: UpdateTodoInput) => {
  return apiRequest<{ todo: Todo }>(`/todos/${id}`, {
    method: 'PATCH',
    body: input,
  });
};

export const deleteTodo = (id: string) => {
  return apiRequest<void>(`/todos/${id}`, { method: 'DELETE' });
};

export interface CalendarEntry {
  color: string;
  status: Status;
}

export const getCalendarSummary = (year: number, month: number) => {
  return apiRequest<{ summary: Record<string, CalendarEntry[]> }>(
    `/todos/calendar/${year}/${month}`
  );
};

export const moveStale = (today: string) => {
  return apiRequest<{ moved: number }>('/todos/move-stale', {
    method: 'POST',
    body: { today },
  });
};