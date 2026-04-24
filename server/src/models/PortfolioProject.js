import mongoose from 'mongoose'

const portfolioProjectSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        githubUrl: { type: String, trim: true },
        liveUrl: { type: String, required: true, trim: true },
        techStack: [{ type: String, trim: true }],
        previewUrl: { type: String }
    },
    { timestamps: true }
)

const PortfolioProject = mongoose.model('PortfolioProject', portfolioProjectSchema)

export default PortfolioProject
