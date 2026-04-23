import { Router } from 'express'
import { createGig, getGigs } from '../controllers/gigController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getGigs)
router.post('/', requireAuth, createGig)

export default router
