import Project from '../models/Project.js'

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean()
        res.json(projects)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load projects.' })
    }
}

export const createProject = async (req, res) => {
    try {
        const { title, status, budget, progress, dueDate } = req.body

        if (!title) {
            return res.status(400).json({ message: 'Project title is required.' })
        }

        const project = await Project.create({
            userId: req.user._id,
            title,
            status,
            budget,
            progress,
            dueDate,
            role: req.user.role,
        })

        res.status(201).json(project)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project.' })
    }
}
