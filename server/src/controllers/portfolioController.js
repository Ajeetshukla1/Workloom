import PortfolioProject from '../models/PortfolioProject.js'

// @desc    Get user's portfolio projects
// @route   GET /api/portfolio
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const projects = await PortfolioProject.find({ userId: req.user._id }).sort({ createdAt: -1 })
        res.json(projects)
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

// @desc    Add a new portfolio project
// @route   POST /api/portfolio
// @access  Private
export const addProject = async (req, res) => {
    try {
        // Enforce max 4 projects
        const count = await PortfolioProject.countDocuments({ userId: req.user._id })
        if (count >= 4) {
            return res.status(400).json({ message: 'Maximum of 4 projects allowed. Please delete one to add a new project.' })
        }

        const { title, description, githubUrl, liveUrl, techStack } = req.body

        // Basic validation
        if (!title || !description || !liveUrl) {
            return res.status(400).json({ message: 'Title, description, and live URL are required.' })
        }

        // Auto-generate a screenshot preview of the live URL using microlink.io
        const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&embed=screenshot.url`

        const project = new PortfolioProject({
            userId: req.user._id,
            title,
            description,
            githubUrl,
            liveUrl,
            techStack: Array.isArray(techStack) ? techStack : [],
            previewUrl
        })

        const createdProject = await project.save()
        res.status(201).json(createdProject)
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating project' })
    }
}

// @desc    Update a portfolio project
// @route   PUT /api/portfolio/:id
// @access  Private
export const updateProject = async (req, res) => {
    try {
        const project = await PortfolioProject.findById(req.params.id)

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Make sure the user owns the project
        if (project.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        const { title, description, githubUrl, liveUrl, techStack } = req.body

        project.title = title || project.title
        project.description = description || project.description
        project.githubUrl = githubUrl !== undefined ? githubUrl : project.githubUrl
        
        if (liveUrl && liveUrl !== project.liveUrl) {
            project.liveUrl = liveUrl
            project.previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&embed=screenshot.url`
        }
        
        if (techStack) {
            project.techStack = Array.isArray(techStack) ? techStack : []
        }

        const updatedProject = await project.save()
        res.json(updatedProject)
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating project' })
    }
}

// @desc    Delete a portfolio project
// @route   DELETE /api/portfolio/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await PortfolioProject.findById(req.params.id)

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        if (project.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        await project.deleteOne()
        res.json({ message: 'Project removed' })
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting project' })
    }
}
