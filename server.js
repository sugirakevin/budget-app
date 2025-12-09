const express = require('express');
const cors = require('cors');
const path = require('path');
const scrapeHandler = require('./api/scrape');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./api/database');

const { startScheduler } = require('./api/scheduler');

const app = express();
const PORT = 3001;
const SECRET_KEY = process.env.SECRET_KEY || "super_secret_budget_key";

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public'));

// Start Scheduler
startScheduler();

// API Route
app.get('/api/scrape', scrapeHandler);

// Health Check
app.get('/api/health', (req, res) => {
    const dbType = process.env.DATABASE_URL || process.env.POSTGRES_URL ? 'PostgreSQL' : 'SQLite';

    // Try a simple query
    db.get("SELECT 1 as val", [], (err, row) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                database: dbType,
                message: err.message
            });
        }
        res.json({
            status: 'ok',
            database: dbType,
            val: row ? row.val : null
        });
    });
});

// ... (Auth Routes remain the same) ...



// Auth Routes
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: err.message });
        }

        // Auto-login after register
        const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "User registered", token, user: { id: this.lastID, email } });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "Login successful", token, user: { id: user.id, email: user.email } });
    });
});

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Notification Routes
app.get('/api/notifications', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ notifications: rows });
    });
});

app.post('/api/notifications/mark-read', authenticateToken, (req, res) => {
    const { id } = req.body;
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Marked as read" });
    });
});

// Budget Routes
// Budget Routes
app.post('/api/budget', authenticateToken, (req, res) => {
    const budgetData = req.body;
    if (!budgetData) return res.status(400).json({ error: "No data provided" });

    db.run(`UPDATE users SET budget_data = ? WHERE id = ?`, [JSON.stringify(budgetData), req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Budget saved successfully" });
    });
});

app.get('/api/budget', authenticateToken, (req, res) => {
    db.get(`SELECT budget_data FROM users WHERE id = ?`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        let data = null;
        if (row && row.budget_data) {
            try {
                data = JSON.parse(row.budget_data);
            } catch (e) {
                console.error("Error parsing budget data", e);
            }
        }
        res.json(data || {});
    });
});

app.post('/api/change-password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
    }

    db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: "Invalid current password" });

        const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedNewPassword, req.user.id], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update password" });
            res.json({ message: "Password updated successfully" });
        });
    });
});

// Catch-all for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        const os = require('os');
        const networkInterfaces = os.networkInterfaces();
        const addresses = [];

        // Get all local IP addresses
        for (const name of Object.keys(networkInterfaces)) {
            for (const net of networkInterfaces[name]) {
                // Skip internal (loopback) and non-IPv4 addresses
                if (net.family === 'IPv4' && !net.internal) {
                    addresses.push(net.address);
                }
            }
        }

        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`\n📱 Access from this computer:`);
        console.log(`   http://localhost:${PORT}`);

        if (addresses.length > 0) {
            console.log(`\n📱 Access from other devices on your network:`);
            addresses.forEach(addr => {
                console.log(`   http://${addr}:${PORT}`);
            });
        }

        console.log(`\n🔧 API endpoint:`);
        console.log(`   http://localhost:${PORT}/api/scrape?country=CZ\n`);
    });
}

module.exports = app;
