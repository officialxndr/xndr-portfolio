import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
  const { published } = req.query
  let rows
  if (published !== undefined) {
    rows = db.prepare('SELECT * FROM projects WHERE published = ? ORDER BY sort_order ASC, title ASC').all(Number(published))
  } else {
    rows = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, title ASC').all()
  }
  const parsed = rows.map(r => ({ ...r, tags: JSON.parse(r.tags), content: JSON.parse(r.content) }))
  res.json(parsed)
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json({ ...row, tags: JSON.parse(row.tags), content: JSON.parse(row.content) })
})

router.post('/', requireAuth, (req, res) => {
  const { id, title, category, tags, thumbnail, template, custom_component, sort_order, published, description, content } = req.body
  db.prepare(`
    INSERT INTO projects (id, title, category, tags, thumbnail, template, custom_component, sort_order, published, description, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, category, JSON.stringify(tags ?? []), thumbnail ?? '', template, custom_component ?? '', sort_order ?? 0, published ?? 1, description ?? '', JSON.stringify(content ?? {}))
  res.status(201).json({ id })
})

router.put('/:id', requireAuth, (req, res) => {
  const { title, category, tags, thumbnail, template, custom_component, sort_order, published, description, content } = req.body
  const result = db.prepare(`
    UPDATE projects SET title=?, category=?, tags=?, thumbnail=?, template=?, custom_component=?, sort_order=?, published=?, description=?, content=?
    WHERE id=?
  `).run(title, category, JSON.stringify(tags ?? []), thumbnail ?? '', template, custom_component ?? '', sort_order ?? 0, published ?? 1, description ?? '', JSON.stringify(content ?? {}), req.params.id)
  if (!result.changes) return res.status(404).json({ error: 'Not found' })
  res.json({ id: req.params.id })
})

router.patch('/:id', requireAuth, (req, res) => {
  const allowed = ['published', 'sort_order', 'title', 'category']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' })
  const set = updates.map(([k]) => `${k}=?`).join(', ')
  const vals = updates.map(([, v]) => v)
  db.prepare(`UPDATE projects SET ${set} WHERE id=?`).run(...vals, req.params.id)
  res.json({ id: req.params.id })
})

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id)
  res.json({ deleted: req.params.id })
})

export default router
