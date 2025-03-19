import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
userId:{
    type:String,
    required:true,
    unique:true
},
emailId:{
    type:String,
    required:true,
    unique:true,
    trim:true
},
role:{
    type:String,
    enum:["user","admin","moderator"],
    default:"user"
},
avatar:{
    type:String
}
},
{
    timestamps:true
});

const User = mongoose.model("User",userSchema);
export default User;