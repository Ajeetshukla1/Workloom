import mongoose from 'mongoose'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import User from '../models/User.js'

const getBucket = () => {
    if (!mongoose.connection?.db) {
        throw new Error('Database connection is not ready.')
    }

    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
    })
}

const buildFileUrl = (req, fileId) => {
    if (!fileId) {
        return null
    }

    const host = req.get('host')
    return `${req.protocol}://${host}/api/files/${fileId}`
}

const storeBuffer = async ({ buffer, filename, contentType, metadata }) => {
    const bucket = getBucket()

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType,
            metadata,
        })

        uploadStream.on('error', reject)
        uploadStream.on('finish', () => resolve(uploadStream.id))
        uploadStream.end(buffer)
    })
}

const deleteFile = async (fileId) => {
    if (!fileId) {
        return
    }

    const bucket = getBucket()
    await bucket.delete(new mongoose.Types.ObjectId(fileId))
}

const extractContactInfo = (text) => {
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/)

    return {
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
    }
}

const extractSkills = (text) => {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    const skillsIndex = lines.findIndex((line) => /skills?/i.test(line))

    if (skillsIndex >= 0) {
        const skillsLine = lines[skillsIndex + 1] || ''
        if (skillsLine) {
            return skillsLine
                .split(/,|\u2022|\u00b7/)
                .map((skill) => skill.trim())
                .filter(Boolean)
        }
    }

    return []
}

const getTextFromResume = async (file) => {
    if (!file) {
        return ''
    }

    if (file.mimetype === 'application/pdf') {
        const result = await pdfParse(file.buffer)
        return result.text || ''
    }

    if (
        file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        return result.value || ''
    }

    if (file.mimetype === 'text/plain') {
        return file.buffer.toString('utf8')
    }

    return ''
}

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Avatar file is required.' })
        }

        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: 'Only image uploads are allowed.' })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        if (user.avatarFileId) {
            await deleteFile(user.avatarFileId)
        }

        const fileId = await storeBuffer({
            buffer: req.file.buffer,
            filename: `avatar-${user._id}-${Date.now()}`,
            contentType: req.file.mimetype,
            metadata: { type: 'avatar', userId: user._id.toString() },
        })

        user.avatarFileId = fileId
        await user.save()

        const avatarUrl = buildFileUrl(req, fileId)
        res.json({
            avatarUrl,
            user: {
                ...user.toObject(),
                avatarUrl,
                resumeUrl: buildFileUrl(req, user.resumeFileId),
            },
        })
    } catch (error) {
        res.status(500).json({ message: 'Avatar upload failed.' })
    }
}

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resume file is required.' })
        }

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res
                .status(400)
                .json({ message: 'Resume must be PDF, DOCX, or TXT.' })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        if (user.resumeFileId) {
            await deleteFile(user.resumeFileId)
        }

        const text = await getTextFromResume(req.file)
        const contact = extractContactInfo(text)
        const skills = extractSkills(text)

        const fileId = await storeBuffer({
            buffer: req.file.buffer,
            filename: `resume-${user._id}-${Date.now()}`,
            contentType: req.file.mimetype,
            metadata: { type: 'resume', userId: user._id.toString() },
        })

        user.resumeFileId = fileId
        user.resumeFilename = req.file.originalname
        user.resumeExtracted = {
            name: user.resumeExtracted?.name || user.name,
            email: contact.email || user.email,
            phone: contact.phone || user.phone || '',
            skills: skills.length ? skills : user.skills,
        }

        if (!user.phone && contact.phone) {
            user.phone = contact.phone
        }

        if (!user.skills?.length && skills.length) {
            user.skills = skills
        }

        await user.save()

        res.json({
            resumeUrl: buildFileUrl(req, fileId),
            extracted: user.resumeExtracted,
            user: {
                ...user.toObject(),
                avatarUrl: buildFileUrl(req, user.avatarFileId),
                resumeUrl: buildFileUrl(req, user.resumeFileId),
            },
        })
    } catch (error) {
        res.status(500).json({ message: 'Resume upload failed.' })
    }
}

export const getFile = async (req, res) => {
    try {
        const fileId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: 'Invalid file id.' })
        }

        const bucket = getBucket()
        const fileCursor = bucket.find({ _id: new mongoose.Types.ObjectId(fileId) })
        const files = await fileCursor.toArray()
        if (!files.length) {
            return res.status(404).json({ message: 'File not found.' })
        }

        const file = files[0]
        if (file.contentType) {
            res.setHeader('Content-Type', file.contentType)
        }
        res.setHeader('Cache-Control', 'public, max-age=3600')

        const downloadStream = bucket.openDownloadStream(file._id)
        downloadStream.on('error', () => {
            res.status(500).end()
        })
        downloadStream.pipe(res)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load file.' })
    }
}
