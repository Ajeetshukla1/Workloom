import { Router } from 'express'
import { getEarnings, upsertEarnings } from '../controllers/earningsController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getEarnings)
router.put('/', requireAuth, upsertEarnings)

export default router
