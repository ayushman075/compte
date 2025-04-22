import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true
    },
    platform: {
        type: String,
        enum: ["Codeforces", "Codechef", "Leetcode", "Atcoder", "HackerRank", "HackerEarth"],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        default:Date.now,
    },
    duration: {
        type: String,
        required: true
    },
    pcdLink: {
        type:String
    }
},{timestamps:true})

const Contest = mongoose.model("Contest",contestSchema);
export default Contest;