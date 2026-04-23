import mongoose from 'mongoose'

const earningsSummarySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        totalEarned: { type: Number, default: 0, min: 0 },
        monthEarned: { type: Number, default: 0, min: 0 },
        pending: { type: Number, default: 0, min: 0 },
        available: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
)

const EarningsSummary = mongoose.model('EarningsSummary', earningsSummarySchema)

export default EarningsSummary
