import { Router } from 'express'
import { getFile } from '../controllers/fileController.js'

const router = Router()

router.get('/:id', getFile)

export default router
