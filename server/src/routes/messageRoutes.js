import { Router } from 'express'
import { createMessageThread, getMessages } from '../controllers/messageController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getMessages)
router.post('/', requireAuth, createMessageThread)

export default router
