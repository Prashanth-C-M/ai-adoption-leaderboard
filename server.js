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
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        icon TEXT,
        score INTEGER,
        history TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err);
        }
    });

    // Create Reasons Mapping Table
    db.run(`CREATE TABLE IF NOT EXISTS reason_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason TEXT,
        description TEXT,
        points INTEGER
    )`, (err) => {
        if (err) {
            console.error("Error creating reason_mappings table:", err);
        }
    });
}

// API Routes - Auth
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], function(err) {
        if (err) {
            return res.status(400).json({ error: "User already exists or error occurred." });
        }
        res.json({ message: "Registered successfully. Please login." });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Add this line
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) {
            console.error('Login database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            console.log('Login failed for user:', email);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        console.log('Login successful for user:', email);
        res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
    });
});

app.post('/api/auth/check', (req, res) => {
    const { email } = req.body;
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exists: !!row });
    });
});

// API Routes - Reasons
app.get('/api/reasons', (req, res) => {
    db.all("SELECT * FROM reason_mappings", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/reasons', (req, res) => {
    const { reason, description, points } = req.body;
    const sql = "INSERT INTO reason_mappings (reason, description, points) VALUES (?, ?, ?)";
    
    db.run(sql, [reason, description, points], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, reason, description, points });
    });
});

app.put('/api/reasons/:id', (req, res) => {
    const { reason, description, points } = req.body;
    const sql = "UPDATE reason_mappings SET reason = ?, description = ?, points = ? WHERE id = ?";
    
    db.run(sql, [reason, description, points, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Updated", changes: this.changes });
    });
});

app.delete('/api/reasons/:id', (req, res) => {
    const sql = "DELETE FROM reason_mappings WHERE id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// API Routes - Teams
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
