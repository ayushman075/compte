import { Router } from "express";
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { addBookmark, getBookmarks, removeBookmark } from "../controllers/bookmark.controller.js";

const bookmarkRouter = Router()

bookmarkRouter.route('/create').post(
    ClerkExpressWithAuth(),
    addBookmark
)
bookmarkRouter.route('/delete/:contestId').delete(
    ClerkExpressRequireAuth(),
    removeBookmark
)
bookmarkRouter.route('/getAll').get(
    ClerkExpressRequireAuth(),
    getBookmarks
)

export default bookmarkRouter
