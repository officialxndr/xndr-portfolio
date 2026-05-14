import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_config').all()
  const config = Object.fromEntries(rows.map(r => [r.key, r.value]))
  res.json(config)
})

router.put('/', requireAuth, (req, res) => {
  const upsert = db.prepare(
    `INSERT INTO site_config (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`
  )
  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, String(value))
  })
  updateMany(Object.entries(req.body))
  res.json({ ok: true })
})

export default router
