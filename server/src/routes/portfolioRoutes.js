import express from 'express'
import {
    getProjects,
    addProject,
    updateProject,
    deleteProject
} from '../controllers/portfolioController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
    .get(requireAuth, getProjects)
    .post(requireAuth, addProject)

router.route('/:id')
    .put(requireAuth, updateProject)
    .delete(requireAuth, deleteProject)

export default router
