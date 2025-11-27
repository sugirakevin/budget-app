const path = require('path');

// Check if running in production with PostgreSQL
const isPostgres = !!process.env.DATABASE_URL;

let db;

if (isPostgres) {
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('Connected to PostgreSQL database.');

    // Wrapper to make PG behave like SQLite
    db = {
        query: (text, params) => pool.query(text, params),

        // SQLite: db.get(sql, params, callback)
        get: (sql, params, callback) => {
            // Convert ? to $1, $2...
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);

            pool.query(pgSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows[0]);
            });
        },

        // SQLite: db.all(sql, params, callback)
        all: (sql, params, callback) => {
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);

            pool.query(pgSql, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows);
            });
        },

        // SQLite: db.run(sql, params, callback)
        // Note: SQLite callback uses 'this.lastID' and 'this.changes'
        // We need to simulate this context for PG
        run: (sql, params, callback) => {
            let i = 1;
            let pgSql = sql.replace(/\?/g, () => `$${i++}`);

            // Handle INSERT RETURNING id for simulating this.lastID
            if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
                pgSql += ' RETURNING id';
            }

            pool.query(pgSql, params, (err, res) => {
                if (err) {
                    if (callback) callback(err);
                    return;
                }

                // Simulate SQLite context
                const context = {
                    lastID: res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : 0,
                    changes: res.rowCount
                };

                if (callback) callback.call(context, null);
            });
        }
    };

} else {
    // Local SQLite
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, '../budget.db');

    const sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database ' + dbPath, err.message);
        } else {
            console.log('Connected to the SQLite database.');
            initSqliteSchema(sqliteDb);
        }
    });

    db = sqliteDb;
}

function initSqliteSchema(database) {
    // Create Users Table
    database.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        budget_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("Error creating users table:", err);
        else {
            // Migration: Add budget_data column if it doesn't exist
            database.run(`ALTER TABLE users ADD COLUMN budget_data TEXT`, (err) => {
                // Ignore error if column already exists
            });
        }
    });

    // Create Notifications Table
    database.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        diff_amount INTEGER,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error("Error creating notifications table:", err);
    });
}

module.exports = db;
