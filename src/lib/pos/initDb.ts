import fs from 'fs';
import path from 'path';
import { db } from './sqlite';

let initialized = false;

export function initDb() {
  if (initialized) return;

  const schemaPath = path.join(
    process.cwd(),
    'src',
    'lib',
    'pos',
    'db',
    'schema.sql'
  );

  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);

  initialized = true;

  console.log('SQLite database initialized');
}