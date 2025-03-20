import dotenv from "dotenv";
import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import { ClerkExpressWithAuth,ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import connectDB from "./configs/db.config.js";
import { fetchCodeChefContests, fetchCodeforcesContests, fetchLeetcodeContestsPuppeteer } from "./services/scrapper.js";
import {scrapeContests,scrapePCDLinks} from './cron.js'



const app = express();

dotenv.config({
    path: '.env'
});


app.use(cors(
    {
    origin:["https://compte-pi.vercel.app","http://localhost:5173", "http://localhost","http://localhost:8000","https://qulth.vercel.app"],
    methods:["GET","POST","OPTIONS","PUT","UPDATE","DELETE"],
    credentials: true
}
));



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());



//Route Import
import authRouter from "./routes/user.route.js";
import contestRouter from "./routes/contest.route.js";
import bookmarkRouter from "./routes/bookmark.route.js";



app.use("/api/v1/auth", express.raw({ type: "application/json" }),authRouter );
app.use("/api/v1/contests",contestRouter)
app.use("/api/v1/bookmark",bookmarkRouter)

app.get('/', (req, res) => {
    res.send('Welcome to Compte, on this line you are talking to Compte server !!');
});



connectDB().then(() => {
    const port = process.env.PORT || 3005;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}).catch((err) => {
    console.log("Error connecting to database !!", err);
});

scrapeContests();
scrapePCDLinks();