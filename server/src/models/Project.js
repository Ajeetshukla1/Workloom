import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        status: { type: String, default: 'Active', trim: true },
        budget: { type: Number, min: 0 },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        dueDate: { type: String, trim: true },
        role: { type: String, enum: ['buyer', 'seller'], required: true },
    },
    { timestamps: true }
)

const Project = mongoose.model('Project', projectSchema)

export default Project
