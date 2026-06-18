import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getCalendarSummary,
  moveStale,
} from '../controllers/todosController';

const router = Router();

router.use(requireAuth);

router.get('/calendar/:year/:month', getCalendarSummary);
router.post('/move-stale', moveStale);
router.get('/', getTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;