import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { Webhook } from "svix";


const clerkWebhookListener = AsyncHandler(async (req,res)=>{
    const SIGNING_SECRET =  process.env.CLERK_WEBHOOK_SECRET_KEY;
    if (!SIGNING_SECRET) {
      console.error("Error: SIGNING_SECRET is missing in environment variables.");
      return res.status(500).json(new ApiResponse(500,{},"Internal server error",false));
    }

    const webhook = new Webhook(SIGNING_SECRET);

    const headers = req.headers;
    const payload = JSON.stringify(req.body);
    
    

    
    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json(
        new ApiResponse(400,{},"Missing Svix headers for webhook verification",false)
       );
    }

    let evt;
    try {
      evt = webhook.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json(
        new ApiResponse(400,{},"Webhook verification failed",false));
    }

    const userData = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
        const user = {
          userId: userData.id,
          emailId: userData.email_addresses?.[0]?.email_address,
          avatar: userData.image_url,
        };
        await User.findOneAndUpdate(
            { userId: userData.id },
            user,
            { upsert: true, new: true }
          );
      }

    return res.status(200).json(
        new ApiResponse(200,{},"Webhook processed successfully",true)
       );
    
})



const updateUserProfile = AsyncHandler(async (req,res)=>{
  const {role} = req.body;
  const userId = req.auth.userId;
  if(!userId){
    return res.status(401).json(new ApiResponse(401,{},"Unautorized Request",false))
  }
  if(!userName || !fullName){
    return res.status(409).json(new ApiResponse(409,{},"Some fields are empty",false))
  }


  const user = await User.findOne({userId:userId});
  if(!user){
    return res.status(404).json(new ApiResponse(404,{},"User not found",false))
  }

  const updatedUser = await User.findOneAndUpdate(
    {userId:userId},
    {
      role
    },
    {
      new:true
    }
  )  
    return res.status(200).json(new ApiResponse(200,updatedUser,"User updated successfully",true))
 

})
  

const getUserProfile = AsyncHandler(async (req,res)=>{
  const userId = req.auth.userId;
  if(!userId){
    return res.status(401).json(new ApiResponse(401,{},"Unautorized Request",false))
  }

  const user = await User.findOne({userId:userId});
  if(!user){
    return res.status(404).json(new ApiResponse(404,{},"User not found",false))
  }

  return res.status(200).json(new ApiResponse(200,user,"User retrieved successfully",true))
})

 
export {clerkWebhookListener,updateUserProfile,getUserProfile}