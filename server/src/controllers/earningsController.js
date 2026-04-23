import EarningsSummary from '../models/EarningsSummary.js'

export const getEarnings = async (req, res) => {
    try {
        const summary = await EarningsSummary.findOne({ userId: req.user._id }).lean()
        if (!summary) {
            return res.json({
                totalEarned: 0,
                monthEarned: 0,
                pending: 0,
                available: 0,
            })
        }

        res.json(summary)
    } catch (error) {
        res.status(500).json({ message: 'Failed to load earnings.' })
    }
}

export const upsertEarnings = async (req, res) => {
    try {
        const { totalEarned, monthEarned, pending, available } = req.body

        const summary = await EarningsSummary.findOneAndUpdate(
            { userId: req.user._id },
            {
                totalEarned: totalEarned ?? 0,
                monthEarned: monthEarned ?? 0,
                pending: pending ?? 0,
                available: available ?? 0,
            },
            { new: true, upsert: true }
        )

        res.json(summary)
    } catch (error) {
        res.status(500).json({ message: 'Failed to update earnings.' })
    }
}
