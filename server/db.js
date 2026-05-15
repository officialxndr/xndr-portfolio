import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(join(DATA_DIR, 'portfolio.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT '',
    tags            TEXT NOT NULL DEFAULT '[]',
    thumbnail       TEXT DEFAULT '',
    template        TEXT NOT NULL DEFAULT 'video',
    custom_component TEXT DEFAULT '',
    sort_order      INTEGER DEFAULT 0,
    published       INTEGER DEFAULT 1,
    description     TEXT DEFAULT '',
    content         TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`)

const defaults = [
  ['site_name', 'Your Name'],
  ['tagline', 'Creative Portfolio'],
  ['hero_video', ''],
  ['logo', ''],
  ['hero_morph_texts', '[]'],
  ['hero_morph_speed', '1'],
]

const upsertConfig = db.prepare(
  `INSERT INTO site_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`
)
for (const [key, value] of defaults) upsertConfig.run(key, value)

export default db
