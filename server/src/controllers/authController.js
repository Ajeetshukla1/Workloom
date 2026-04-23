import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
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

const buildFileUrl = (req, fileId) => {
    if (!fileId) {
        return null
    }

    const host = req.get('host')
    return `${req.protocol}://${host}/api/files/${fileId}`
}

const buildUserResponse = (user, req) => {
    const data = user.toObject ? user.toObject() : { ...user }

    return {
        ...data,
        avatarUrl: buildFileUrl(req, data.avatarFileId),
        resumeUrl: buildFileUrl(req, data.resumeFileId),
        githubConnected: Boolean(data.githubId),
    }
}

const ensureGithubConfig = () => {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('GitHub OAuth is not configured')
    }

    return { clientId, clientSecret, redirectUri }
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
            'phone',
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

        res.json(buildUserResponse(user, req))
    } catch (error) {
        res.status(500).json({ message: 'Profile update failed.' })
    }
}

export const me = async (req, res) => {
    res.json(buildUserResponse(req.user, req))
}

export const startGithubAuth = async (req, res) => {
    try {
        const { clientId, redirectUri } = ensureGithubConfig()
        const state = crypto.randomBytes(16).toString('hex')

        res.cookie('gh_oauth_state', state, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000,
        })

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'read:user user:email',
            state,
        })

        res.redirect(`https://github.com/login/oauth/authorize?${params}`)
    } catch (error) {
        res.status(500).json({ message: 'GitHub auth failed to start.' })
    }
}

export const githubCallback = async (req, res) => {
    try {
        const { clientId, clientSecret, redirectUri } = ensureGithubConfig()
        const { code, state } = req.query
        const storedState = req.cookies?.gh_oauth_state

        if (!code || !state || state !== storedState) {
            return res.status(400).json({ message: 'Invalid GitHub state.' })
        }

        res.clearCookie('gh_oauth_state')

        const tokenResponse = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    redirect_uri: redirectUri,
                }),
            }
        )

        const tokenPayload = await tokenResponse.json()
        if (!tokenPayload.access_token) {
            return res.status(400).json({ message: 'GitHub access token missing.' })
        }

        const githubResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenPayload.access_token}`,
                Accept: 'application/vnd.github+json',
            },
        })
        const githubUser = await githubResponse.json()

        const reposResponse = await fetch(
            'https://api.github.com/user/repos?per_page=100&sort=updated',
            {
                headers: {
                    Authorization: `Bearer ${tokenPayload.access_token}`,
                    Accept: 'application/vnd.github+json',
                },
            }
        )
        const repos = await reposResponse.json().catch(() => [])
        const languageCounts = Array.isArray(repos)
            ? repos.reduce((acc, repo) => {
                if (repo.language) {
                    acc[repo.language] = (acc[repo.language] || 0) + 1
                }
                return acc
            }, {})
            : {}
        const topLanguages = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([language]) => language)
            .slice(0, 8)

        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${tokenPayload.access_token}`,
                Accept: 'application/vnd.github+json',
            },
        })
        const emails = await emailResponse.json().catch(() => [])
        const primaryEmail = Array.isArray(emails)
            ? emails.find((entry) => entry.primary && entry.verified)
            : null

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        user.githubId = String(githubUser.id)
        user.githubUsername = githubUser.login
        user.githubAvatarUrl = githubUser.avatar_url
        user.githubProfileUrl = githubUser.html_url

        if (!user.headline && githubUser.bio) {
            user.headline = githubUser.bio
        }

        if (!user.bio && githubUser.bio) {
            user.bio = githubUser.bio
        }

        if (!user.location && githubUser.location) {
            user.location = githubUser.location
        }

        if (!user.portfolioUrl && githubUser.blog) {
            user.portfolioUrl = githubUser.blog
        }

        if ((!user.skills || user.skills.length === 0) && topLanguages.length) {
            user.skills = topLanguages
        }

        if (!user.email && primaryEmail?.email) {
            user.email = primaryEmail.email
        }

        if (!user.name && githubUser.name) {
            user.name = githubUser.name
        }

        await user.save()

        const redirectTarget =
            process.env.CLIENT_ORIGIN || 'http://localhost:5173'
        res.redirect(`${redirectTarget}/profile?github=connected`)
    } catch (error) {
        res.status(500).json({ message: 'GitHub connection failed.' })
    }
}
