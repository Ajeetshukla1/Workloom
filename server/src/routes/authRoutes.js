import { Router } from 'express'
import multer from 'multer'
import {
    githubCallback,
    login,
    logout,
    me,
    register,
    requestPasswordReset,
    resetPassword,
    startGithubAuth,
    updateMe,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadAvatar, uploadResume } from '../controllers/fileController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.get('/github', requireAuth, startGithubAuth)
router.get('/github/callback', requireAuth, githubCallback)
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar)
router.post('/me/resume', requireAuth, upload.single('resume'), uploadResume)
router.patch('/me', requireAuth, updateMe)
router.get('/me', requireAuth, me)

export default router
