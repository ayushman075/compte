import { Router } from "express";
import { clerkWebhookListener, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";





const authRouter = Router()

authRouter.route('/webhook/clerk').post(
    clerkWebhookListener
)
authRouter.route('/get').get(
    ClerkExpressRequireAuth(),
    getUserProfile
)

authRouter.route('/update').post(
    ClerkExpressRequireAuth(),
    updateUserProfile
)
export default authRouter
