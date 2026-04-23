import Gig from '../models/Gig.js'

export const getGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean()
        res.json(gigs)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load gigs.' })
    }
}

export const createGig = async (req, res) => {
    try {
        const { title, category, description, price, deliveryTime, tags } = req.body

        if (!title || !category || !description || price === undefined) {
            return res.status(400).json({ message: 'Title, category, description, and price are required.' })
        }

        const gig = await Gig.create({
            userId: req.user._id,
            title,
            category,
            description,
            price,
            deliveryTime,
            tags,
        })

        res.status(201).json(gig)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create gig.' })
    }
}
