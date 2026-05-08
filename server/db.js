import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'shapes.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS shapes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    svg_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
