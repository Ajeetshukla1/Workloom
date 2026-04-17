import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({ message: 'Authentication required.' })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.sub).select('-passwordHash')

        if (!user) {
            return res.status(401).json({ message: 'User not found.' })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired session.' })
    }
}
