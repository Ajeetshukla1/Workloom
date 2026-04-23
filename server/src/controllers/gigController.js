import Gig from '../models/Gig.js'
import Application from '../models/Application.js'
import Project from '../models/Project.js'

export const getGigs = async (req, res) => {
    try {
        const gigs = await Gig.find()
            .populate('userId', 'name avatarUrl githubAvatarUrl')
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

export const applyForGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
        if (!gig) return res.status(404).json({ message: 'Gig not found' })

        if (gig.userId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot apply to your own gig.' })
        }

        const existing = await Application.findOne({ gigId: gig._id, applicantId: req.user._id })
        if (existing) return res.status(400).json({ message: 'You have already applied to this gig.' })

        const application = await Application.create({
            gigId: gig._id,
            applicantId: req.user._id,
            ownerId: gig.userId,
            status: 'pending'
        })
        
        res.status(201).json(application)
    } catch (error) {
        res.status(500).json({ message: 'Application failed.' })
    }
}

export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ ownerId: req.user._id })
            .populate('gigId', 'title price deliveryTime')
            .populate('applicantId', 'name avatarUrl githubAvatarUrl')
            .sort({ createdAt: -1 })
            .lean()
            
        res.json(applications)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch applications.' })
    }
}

export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body
        const application = await Application.findOne({ _id: req.params.id, ownerId: req.user._id }).populate('gigId')
        
        if (!application) return res.status(404).json({ message: 'Application not found' })

        application.status = status
        await application.save()

        if (status === 'approved') {
            await Project.create({
                userId: application.applicantId,
                title: `Gig: ${application.gigId.title}`,
                status: 'Active',
                budget: application.gigId.price || 0,
                role: 'seller' // from the applicant's perspective, they are the seller/freelancer
            })
            
            await Project.create({
                userId: req.user._id,
                title: `Gig: ${application.gigId.title}`,
                status: 'Active',
                budget: application.gigId.price || 0,
                role: 'buyer' // from the gig owner's perspective, they are the buyer
            })
        }

        res.json(application)
    } catch (error) {
        res.status(500).json({ message: 'Update failed.' })
    }
}
