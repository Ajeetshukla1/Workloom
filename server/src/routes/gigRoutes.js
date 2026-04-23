import { Router } from 'express'
import { createGig, getGigs, applyForGig, getMyApplications, updateApplicationStatus } from '../controllers/gigController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getGigs)
router.post('/', requireAuth, createGig)
router.post('/:id/apply', requireAuth, applyForGig)
router.get('/applications', requireAuth, getMyApplications)
router.patch('/applications/:id', requireAuth, updateApplicationStatus)

export default router
