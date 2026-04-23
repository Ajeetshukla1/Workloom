import { Router } from 'express'
import { createProject, getProjects } from '../controllers/projectController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getProjects)
router.post('/', requireAuth, createProject)

export default router
