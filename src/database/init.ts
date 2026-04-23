import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('machines.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS machines (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      photos      TEXT    NOT NULL DEFAULT '[]',
      parts       TEXT    NOT NULL DEFAULT '[]',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default db;
