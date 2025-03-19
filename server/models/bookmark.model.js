import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest", 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    remainder:{
        type:Date
    }
},{timestamp:true})

const Bookmark = mongoose.model("Bookmark",bookmarkSchema);
export default Bookmark;