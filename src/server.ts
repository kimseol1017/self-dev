import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, '../data/store.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

interface MessageEntry {
  id: string;
  text: string;
  date: string;       // "YYYY-MM-DD"
  createdAt: string;
}

interface Store {
  currentMessage: string;
  messages: MessageEntry[];
  todos: Todo[];
  lastUpdated: string;
}

// ─────────────────────────────────────────────
// File I/O helpers
// ─────────────────────────────────────────────

function readStore(): Store {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultStore: Store = {
      currentMessage: '',
      messages: [],
      todos: [],
      lastUpdated: new Date().toISOString(),
    };
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStore, null, 2));
    return defaultStore;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Store>;
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.currentMessage && (parsed as any).message) {
      parsed.currentMessage = (parsed as any).message;
    }
    parsed.currentMessage = parsed.currentMessage ?? '';
    parsed.todos = parsed.todos ?? [];
    return parsed as Store;
  } catch {
    return { currentMessage: '', messages: [], todos: [], lastUpdated: new Date().toISOString() };
  }
}

function writeStore(data: Store): void {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.get('/api/data', (_req: Request, res: Response) => {
  res.json(readStore());
});

// Auto-save draft
app.put('/api/message/draft', (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  const store = readStore();
  store.currentMessage = text ?? '';
  writeStore(store);
  res.json({ success: true });
});

// Manual save to history
app.post('/api/message/save', (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text?.trim()) {
    res.status(400).json({ error: '내용을 입력해주세요.' });
    return;
  }
  const store = readStore();
  const entry: MessageEntry = {
    id: Date.now().toString(),
    text: text.trim(),
    date: todayString(),
    createdAt: new Date().toISOString(),
  };
  store.messages.push(entry);
  store.currentMessage = text.trim();
  writeStore(store);
  res.json(entry);
});

// Delete a message
app.delete('/api/message/:id', (req: Request, res: Response) => {
  const store = readStore();
  store.messages = store.messages.filter(m => m.id !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

// Get messages (optionally filtered by date)
app.get('/api/messages', (req: Request, res: Response) => {
  const store = readStore();
  const { date } = req.query;
  const filtered = date ? store.messages.filter(m => m.date === date) : store.messages;
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(sorted);
});

app.post('/api/todos', (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text?.trim()) { res.status(400).json({ error: '내용을 입력해주세요.' }); return; }
  const store = readStore();
  const todo: Todo = { id: Date.now().toString(), text: text.trim(), done: false, createdAt: new Date().toISOString() };
  store.todos.push(todo);
  writeStore(store);
  res.json(todo);
});

app.patch('/api/todos/:id', (req: Request, res: Response) => {
  const store = readStore();
  const todo = store.todos.find(t => t.id === req.params.id);
  if (!todo) { res.status(404).json({ error: 'Not found' }); return; }
  todo.done = !todo.done;
  writeStore(store);
  res.json(todo);
});

app.delete('/api/todos/:id', (req: Request, res: Response) => {
  const store = readStore();
  store.todos = store.todos.filter(t => t.id !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server → http://localhost:${PORT}`);
});
