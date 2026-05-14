import { Router } from 'express'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { mkdirSync } from 'fs'
import { requireAuth } from '../middleware/auth.js'
import exifr from 'exifr'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = join(__dirname, '..', '..', 'public', 'uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))
  },
})

const router = Router()

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const url = `/uploads/${req.file.filename}`
  let exif = null

  if (req.file.mimetype.startsWith('image/')) {
    try {
      const raw = await exifr.parse(req.file.path, {
        pick: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime',
               'ISO', 'FocalLength', 'DateTimeOriginal'],
      })
      if (raw) {
        exif = {
          camera: [raw.Make, raw.Model].filter(Boolean).join(' ') || null,
          lens: raw.LensModel || null,
          fStop: raw.FNumber ? `f/${raw.FNumber}` : null,
          shutterSpeed: raw.ExposureTime
            ? raw.ExposureTime < 1
              ? `1/${Math.round(1 / raw.ExposureTime)}s`
              : `${raw.ExposureTime}s`
            : null,
          iso: raw.ISO ? `ISO ${raw.ISO}` : null,
          focalLength: raw.FocalLength ? `${raw.FocalLength}mm` : null,
          dateTaken: raw.DateTimeOriginal
            ? new Date(raw.DateTimeOriginal).toLocaleDateString()
            : null,
        }
      }
    } catch { /* EXIF unavailable */ }
  }

  res.json({ url, exif })
})

export default router
