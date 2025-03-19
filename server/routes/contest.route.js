import { Router } from "express";
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { addPcdLink, createContest, deleteContest, getAllContests, getContest, updateContest } from "../controllers/contest.controller.js";

const contestRouter = Router()

contestRouter.route('/create').post(
    ClerkExpressWithAuth(),
    createContest
)
contestRouter.route('/update/:contestId').put(
    ClerkExpressRequireAuth(),
    updateContest
)
contestRouter.route('/delete/:contestId').delete(
    ClerkExpressRequireAuth(),
    deleteContest
)
contestRouter.route('/addPcdLink/:contestId').put(
    ClerkExpressRequireAuth(),
    addPcdLink
)
contestRouter.route('/get/:contestId').get(
    getContest
)
contestRouter.route('/getAll').get(
    getAllContests
)

export default contestRouter
