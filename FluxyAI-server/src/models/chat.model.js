import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        title:{
              type: String,
              required:true,
              trim:true
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },  
    },
{
    timestamps:true,
}
);

export default mongoose.model("Chat", chatSchema);