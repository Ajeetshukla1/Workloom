import mongoose from 'mongoose'

const gigSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, min: 0, required: true },
        deliveryTime: { type: String, trim: true },
        tags: { type: [String], default: [] },
    },
    { timestamps: true }
)

const Gig = mongoose.model('Gig', gigSchema)

export default Gig
