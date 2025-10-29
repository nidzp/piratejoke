const path = require('path');
const Database = require('better-sqlite3');

const DEFAULT_DB_FILENAME = 'piratejoke.db';

function resolveDbPath() {
  const configured = process.env.DATABASE_URL || process.env.SQLITE_URL;
  if (configured && configured !== ':memory:') {
    return configured;
  }

  return path.join(process.cwd(), 'data', DEFAULT_DB_FILENAME);
}

function ensureDataDirectory(dbPath) {
  const dir = path.dirname(dbPath);
  if (dir === '.') {
    return;
  }

  const fs = require('fs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const dbPath = resolveDbPath();
ensureDataDirectory(dbPath);

const dbOptions = {};
if (process.env.SQLITE_DEBUG === 'true') {
  dbOptions.verbose = console.log;
}

const db = new Database(dbPath, dbOptions);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supabase_id TEXT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    tokens INTEGER NOT NULL DEFAULT 20,
    last_search TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS watchlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tmdb_id TEXT NOT NULL,
    title TEXT NOT NULL,
    media_type TEXT NOT NULL,
    poster_url TEXT,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS billing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_reference TEXT,
    tokens INTEGER NOT NULL,
    amount INTEGER,
    currency TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  `,
];

function runMigrations() {
  migrations.forEach((sql) => db.exec(sql));
}

runMigrations();

module.exports = db;
