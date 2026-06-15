import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { getRandomTodoColor } from '../utils/colors';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be a hex code like #FF8C42');

const createTodoSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  date: dateStringSchema.nullable().optional(),
  color: hexColorSchema.optional(),
  urgency: z.enum(['low', 'moderate', 'high']).optional().default('low'),
  status: z.enum(['not_started', 'in_progress', 'done']).optional().default('not_started'),
});

const updateTodoSchema = z.object({
  description: z.string().min(1).optional(),
  date: dateStringSchema.nullable().optional(),
  color: hexColorSchema.optional(),
  urgency: z.enum(['low', 'moderate', 'high']).optional(),
  status: z.enum(['not_started', 'in_progress', 'done']).optional(),
});

// Helper to convert a YYYY-MM-DD string to a Date at UTC midnight,
// so dates are stored/compared consistently regardless of timezone.
const toUtcDate = (dateStr: string): Date => {
  return new Date(`${dateStr}T00:00:00.000Z`);
};

// Helper to format a Date as YYYY-MM-DD for API responses.
const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

const serializeTodo = (todo: any) => ({
  id: todo.id,
  description: todo.description,
  date: formatDate(todo.date),
  color: todo.color,
  urgency: todo.urgency,
  status: todo.status,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
});

// GET /todos?date=YYYY-MM-DD  -> todos for a specific date
// GET /todos?from=YYYY-MM-DD&to=YYYY-MM-DD -> todos in a date range (for calendar dots)
// GET /todos?backlog=true -> todos with no date set (the "someday" pool)
// GET /todos -> all todos for the user
export const getTodos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { date, from, to, backlog } = req.query;

    const where: any = { userId };

    if (backlog === 'true') {
      where.date = null;
    } else if (date && typeof date === 'string') {
      const parsed = dateStringSchema.safeParse(date);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid date format, expected YYYY-MM-DD' });
      }
      where.date = toUtcDate(date);
    } else if (from && to && typeof from === 'string' && typeof to === 'string') {
      const fromParsed = dateStringSchema.safeParse(from);
      const toParsed = dateStringSchema.safeParse(to);
      if (!fromParsed.success || !toParsed.success) {
        return res.status(400).json({ error: 'Invalid date format, expected YYYY-MM-DD' });
      }
      where.date = { gte: toUtcDate(from), lte: toUtcDate(to) };
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    return res.json({ todos: todos.map(serializeTodo) });
  } catch (err) {
    next(err);
  }
};

// GET /todos/:id
export const getTodoById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const todo = await prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    return res.json({ todo: serializeTodo(todo) });
  } catch (err) {
    next(err);
  }
};

// POST /todos
export const createTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = createTodoSchema.parse(req.body);

    const todo = await prisma.todo.create({
      data: {
        userId,
        description: data.description,
        date: data.date ? toUtcDate(data.date) : null,
        color: data.color || getRandomTodoColor(),
        urgency: data.urgency,
        status: data.status,
      },
    });

    return res.status(201).json({ todo: serializeTodo(todo) });
  } catch (err) {
    next(err);
  }
};

// PATCH /todos/:id
export const updateTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = updateTodoSchema.parse(req.body);

    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    const updateData: any = { ...data };
    if (data.date !== undefined) {
      updateData.date = data.date ? toUtcDate(data.date) : null;
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return res.json({ todo: serializeTodo(todo) });
  } catch (err) {
    next(err);
  }
};

// DELETE /todos/:id
export const deleteTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    await prisma.todo.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /todos/calendar/:year/:month -> { "2026-06-01": ["#FF8C42", "#5E60CE"], ... }
// Returns a map of date -> array of todo colors for that month, for calendar dots.
export const getCalendarSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10); // 1-12

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0)); // last day of month

    const todos = await prisma.todo.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      select: { date: true, color: true, status: true },
    });

    const summary: Record<string, { color: string; status: string }[]> = {};
    for (const todo of todos) {
      const key = formatDate(todo.date);
      if (!key) continue; // defensive: range-filtered query should never return null dates
      if (!summary[key]) summary[key] = [];
      summary[key].push({ color: todo.color, status: todo.status });
    }

    return res.json({ summary });
  } catch (err) {
    next(err);
  }
};