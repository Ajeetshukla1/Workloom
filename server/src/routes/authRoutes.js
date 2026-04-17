import { Router } from 'express'
import {
    login,
    logout,
    me,
    register,
    requestPasswordReset,
    resetPassword,
    updateMe,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.patch('/me', requireAuth, updateMe)
router.get('/me', requireAuth, me)

export default router
