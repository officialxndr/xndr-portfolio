import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

import projectsRouter from './routes/projects.js'
import authRouter from './routes/auth.js'
import uploadsRouter from './routes/uploads.js'
import configRouter from './routes/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT ?? 3001
const isProd = process.env.NODE_ENV === 'production'

app.use(cors({ origin: isProd ? false : 'http://localhost:5173' }))
app.use(express.json())

app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')))

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/upload', uploadsRouter)
app.use('/api/config', configRouter)

if (isProd) {
  const distPath = join(__dirname, '..', 'dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*path', (req, res) => res.sendFile(join(distPath, 'index.html')))
  }
}

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
