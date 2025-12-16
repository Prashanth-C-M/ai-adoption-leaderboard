const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        icon TEXT,
        score INTEGER,
        history TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err);
        } else {
            // Check if empty, populate with initial data
            db.get("SELECT count(*) as count FROM teams", (err, row) => {
                if (row.count === 0) {
                    console.log("Seeding database...");
                    const initialTeams = [
                        { name: "Neural Nexus", icon: "fa-brain", score: 9850, history: JSON.stringify([{ points: 500, reason: "Launch MVP", date: "2023-10-01" }, { points: 200, reason: "Weekly Streak", date: "2023-10-08" }]) },
                        { name: "Data Dynamos", icon: "fa-database", score: 9420, history: "[]" },
                        { name: "Cyber Synapse", icon: "fa-network-wired", score: 8900, history: "[]" },
                        { name: "Algorithm Allies", icon: "fa-code-branch", score: 8550, history: "[]" },
                        { name: "Silicon Squad", icon: "fa-microchip", score: 8100, history: "[]" },
                        { name: "Quantum Quest", icon: "fa-atom", score: 7800, history: "[]" },
                        { name: "Logic Legends", icon: "fa-puzzle-piece", score: 7450, history: "[]" },
                        { name: "Binary Brigade", icon: "fa-0", score: 7100, history: "[]" },
                        { name: "Future Forge", icon: "fa-hammer", score: 6800, history: "[]" },
                        { name: "Techno Titans", icon: "fa-robot", score: 6500, history: "[]" }
                    ];
                    
                    const stmt = db.prepare("INSERT INTO teams (name, icon, score, history) VALUES (?, ?, ?, ?)");
                    initialTeams.forEach(team => {
                        stmt.run(team.name, team.icon, team.score, team.history);
                    });
                    stmt.finalize();
                }
            });
        }
    });
}

// API Routes
app.get('/api/teams', (req, res) => {
    db.all("SELECT * FROM teams", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse history JSON
        const teams = rows.map(row => ({
            ...row,
            history: JSON.parse(row.history || "[]")
        }));
        res.json(teams);
    });
});

app.post('/api/teams', (req, res) => {
    const { name, icon, score, history } = req.body;
    const sql = "INSERT INTO teams (name, icon, score, history) VALUES (?, ?, ?, ?)";
    const params = [name, icon, score, JSON.stringify(history || [])];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            name, icon, score, history
        });
    });
});

app.put('/api/teams/:id', (req, res) => {
    const { name, icon, score, history } = req.body;
    const sql = "UPDATE teams SET name = ?, icon = ?, score = ?, history = ? WHERE id = ?";
    const params = [name, icon, score, JSON.stringify(history || []), req.params.id];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Updated", changes: this.changes });
    });
});

app.delete('/api/teams/:id', (req, res) => {
    const sql = "DELETE FROM teams WHERE id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Deleted", changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
