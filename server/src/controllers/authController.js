import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendEmail } from '../services/emailService.js'
import { createTokenPair, hashToken } from '../utils/tokens.js'

const signToken = (user) => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('JWT_SECRET is not set')
    }

    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        const normalizedEmail = email.toLowerCase()
        const existing = await User.findOne({ email: normalizedEmail })

        if (existing) {
            return res.status(409).json({ message: 'Email already in use.' })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        await User.create({
            name,
            email: normalizedEmail,
            passwordHash,
            role,
        })

        res.status(201).json({
            message: 'Account created. You can sign in now.',
        })
    } catch (error) {
        res.status(500).json({ message: 'Registration failed.' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const matches = await bcrypt.compare(password, user.passwordHash)
        if (!matches) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const token = signToken(user)
        setAuthCookie(res, token)

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        })
    } catch (error) {
        res.status(500).json({ message: 'Login failed.' })
    }
}

export const logout = async (_req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Logged out.' })
}

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (user) {
            const { token, hash } = createTokenPair()
            user.resetTokenHash = hash
            user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000)
            await user.save()

            await sendEmail({
                to: user.email,
                subject: 'Reset your Workloom password',
                html: `<p>Your reset token:</p><p><strong>${token}</strong></p>`,
            })
        }

        res.json({ message: 'If the email exists, a reset token was sent.' })
    } catch (error) {
        res.status(500).json({ message: 'Reset request failed.' })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body

        if (!token || !password) {
            return res
                .status(400)
                .json({ message: 'Token and password are required.' })
        }

        const tokenHash = hashToken(token)
        const user = await User.findOne({
            resetTokenHash: tokenHash,
            resetTokenExpires: { $gt: new Date() },
        })

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or expired.' })
        }

        user.passwordHash = await bcrypt.hash(password, 12)
        user.resetTokenHash = undefined
        user.resetTokenExpires = undefined
        await user.save()

        res.json({ message: 'Password updated successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Password reset failed.' })
    }
}

export const updateMe = async (req, res) => {
    try {
        const allowedFields = [
            'name',
            'headline',
            'bio',
            'skills',
            'location',
            'hourlyRate',
            'portfolioUrl',
        ]

        const updates = {}
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field]
            }
        })

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No profile changes provided.' })
        }

        if (updates.skills && !Array.isArray(updates.skills)) {
            return res.status(400).json({ message: 'Skills must be an array.' })
        }

        if (updates.hourlyRate === '') {
            delete updates.hourlyRate
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        }).select('-passwordHash')

        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Profile update failed.' })
    }
}

export const me = async (req, res) => {
    res.json(req.user)
}
