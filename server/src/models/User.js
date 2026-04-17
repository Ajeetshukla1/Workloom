import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            default: 'buyer',
        },
        headline: { type: String, trim: true },
        bio: { type: String, trim: true },
        skills: { type: [String], default: [] },
        location: { type: String, trim: true },
        hourlyRate: { type: Number, min: 0 },
        portfolioUrl: { type: String, trim: true },
        resetTokenHash: String,
        resetTokenExpires: Date,
    },
    { timestamps: true }
)

const User = mongoose.model('User', userSchema)

export default User
