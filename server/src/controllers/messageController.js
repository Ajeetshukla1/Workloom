import MessageThread from '../models/MessageThread.js'

export const getMessages = async (req, res) => {
    try {
        const threads = await MessageThread.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .lean()
        res.json(threads)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load messages.' })
    }
}

export const createMessageThread = async (req, res) => {
    try {
        const { subject, lastMessage } = req.body

        if (!subject) {
            return res.status(400).json({ message: 'Subject is required.' })
        }

        const thread = await MessageThread.create({
            userId: req.user._id,
            subject,
            lastMessage,
            unreadCount: 0,
        })

        res.status(201).json(thread)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create message thread.' })
    }
}
