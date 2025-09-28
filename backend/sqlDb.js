import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Connect MySQL
const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "9652",
    database: "todoApp"
});
console.log("✅ MySQL connected");

await db.query(`
    INSERT IGNORE INTO task_groups (id, name)
    VALUES (1, 'General')
`);

app.get("/groups", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM task_groups");
    res.json(rows);
});

app.post("/groups", async (req, res) => {
    const { name } = req.body;
    const [result] = await db.query("INSERT INTO task_groups (name) VALUES (?)", [name]);
    res.json({ id: result.insertId, name });
});

app.delete("/groups/:id", async (req, res) => {
    await db.query("DELETE FROM task_groups WHERE id = ?", [req.params.id]);
    res.json({ message: "Group deleted" });
});

// 🔹 Tasks API
app.get("/tasks/:groupId", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks WHERE group_id = ?", [req.params.groupId]);
    res.json(rows);
});

app.post("/tasks", async (req, res) => {
    const { text, group_id } = req.body;
    const [result] = await db.query(
        "INSERT INTO tasks (text, group_id) VALUES (?, ?)",
        [text, group_id]
    );
    res.json({ id: result.insertId, text, group_id, completed: false });
});

app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    await db.query("UPDATE tasks SET completed = NOT completed WHERE id = ?", [id]);
    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Task deleted" });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
