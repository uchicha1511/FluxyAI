import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true,
    },
    sender: {
        type: String,
        enum: ["user", "agent"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

const messageModel = mongoose.model("message", messageSchema)

export default messageModel;