import express from "express";
import Database from "better-sqlite3";

const app = express();
const db = new Database("db.sqlite");

app.use(express.json());

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`).run();

// Frontend simple
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Tareas Familia</title>
<style>
body { font-family: sans-serif; max-width: 600px; margin: auto; }
li.done { text-decoration: line-through; color: gray; }
</style>
</head>
<body>
<h1>Tareas</h1>
<input id="task" placeholder="Nueva tarea" />
<button onclick="add()">Añadir</button>
<ul id="list"></ul>

<script>
async function load() {
  const res = await fetch('/tasks');
  const tasks = await res.json();
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t.text;
    li.className = t.done ? 'done' : '';
    li.onclick = () => toggle(t.id);
    const btn = document.createElement('button');
    btn.textContent = '❌';
    btn.onclick = e => { e.stopPropagation(); del(t.id); };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function add() {
  const text = task.value;
  await fetch('/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ text })
  });
  task.value = '';
  load();
}

async function toggle(id) {
  await fetch('/tasks/' + id, { method: 'PUT' });
  load();
}

async function del(id) {
  await fetch('/tasks/' + id, { method: 'DELETE' });
  load();
}

load();
</script>
</body>
</html>
`);
});

// API
app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  db.prepare("INSERT INTO tasks (text) VALUES (?)")
    .run(req.body.text);
  res.sendStatus(201);
});

app.put("/tasks/:id", (req, res) => {
  db.prepare("UPDATE tasks SET done = NOT done WHERE id = ?")
    .run(req.params.id);
  res.sendStatus(200);
});

app.delete("/tasks/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?")
    .run(req.params.id);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🟢 App corriendo en http://localhost:3000");
});
