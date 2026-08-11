import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getPosDb() {
  if (db) return db;

  // Store database in Electron app folder
  const dataDir = path.join(process.cwd(), 'electron-data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'pos.db');

  db = new Database(dbPath);

  // Better concurrent reads/writes
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tableNo TEXT,
      orderType TEXT NOT NULL,
      status TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON string
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      pendingSync INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_orders_pendingSync
    ON orders(pendingSync);
  `);

  return db;
}