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

// Frontend simple y moderno
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Tareas Familia</title>
<style>
  body {
    font-family: 'Segoe UI', sans-serif;
    max-width: 600px;
    margin: 40px auto;
    background: #f9f9f9;
    color: #333;
    padding: 0 20px;
  }

  h1 {
    text-align: center;
    color: #007bff;
  }

  input {
    width: 75%;
    padding: 10px;
    font-size: 16px;
    margin-right: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  button {
    padding: 10px 15px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #007bff;
    color: white;
    transition: background 0.2s;
  }

  button:hover {
    background: #0056b3;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-top: 20px;
  }

  li {
    background: white;
    padding: 10px 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: background 0.2s;
  }

  li.done {
    text-decoration: line-through;
    color: gray;
    background: #e9ecef;
  }

  li button {
    background: #dc3545;
    margin-left: 10px;
  }

  li button:hover {
    background: #a71d2a;
  }
</style>
</head>
<body>
<h1>📝 Tareas Familia</h1>
<div style="text-align:center">
  <input id="task" placeholder="Nueva tarea..." />
  <button onclick="add()">Añadir</button>
</div>
<ul id="list"></ul>

<script>
async function load() {
  const res = await fetch('/tasks');
  const tasks = await res.json();
  const list = document.getElementById('list');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t.text;
    if(t.done) li.classList.add('done');
    li.onclick = () => toggle(t.id);
    const btn = document.createElement('button');
    btn.textContent = '❌';
    btn.onclick = e => { e.stopPropagation(); del(t.id); };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function add() {
  const taskInput = document.getElementById('task');
  const text = taskInput.value.trim();
  if(!text) return;
  await fetch('/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ text })
  });
  taskInput.value = '';
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
  if(!req.body.text || !req.body.text.trim()) return res.sendStatus(400);
  db.prepare("INSERT INTO tasks (text) VALUES (?)").run(req.body.text.trim());
  res.sendStatus(201);
});

app.put("/tasks/:id", (req, res) => {
  db.prepare("UPDATE tasks SET done = NOT done WHERE id = ?").run(req.params.id);
  res.sendStatus(200);
});

app.delete("/tasks/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🟢 App corriendo en http://localhost:3000");
});
