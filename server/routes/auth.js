import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

let adminHash = null

function getAdminHash() {
  if (!adminHash) {
    adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
  }
  return adminHash
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {}

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, getAdminHash())
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

export default router
