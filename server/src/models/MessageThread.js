import mongoose from 'mongoose'

const messageThreadSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        subject: { type: String, required: true, trim: true },
        lastMessage: { type: String, trim: true },
        unreadCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
)

const MessageThread = mongoose.model('MessageThread', messageThreadSchema)

export default MessageThread
