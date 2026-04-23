import ContactMessage from '../models/ContactMessage.js'

export const createContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' })
        }

        const saved = await ContactMessage.create({ name, email, message })
        res.status(201).json({ id: saved._id })
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message.' })
    }
}
