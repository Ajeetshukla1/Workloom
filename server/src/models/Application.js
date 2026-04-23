import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
    {
        gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
        applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
)

const Application = mongoose.model('Application', applicationSchema)

export default Application
