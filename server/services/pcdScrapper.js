import axios from "axios";
import Contest from "../models/contest.model.js";
import dotenv from "dotenv";


dotenv.config({
    path: '.env'
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;


function extractContestName(title) {
    const match = title.match(/^(Leetcode|CodeChef|Codeforces)\s+(.+?)\s*\|/i);
    return match ? match[2].trim() : null;
}

async function fetchPlaylistVideos(playlistId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
        const response = await axios.get(url);
        return response.data.items || [];
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
        return [];
    }
}


async function processVideos(platform, playlistId) {
    const videos = await fetchPlaylistVideos(playlistId);

    for (const video of videos) {
        const title = video.snippet.title;
        const contestName = extractContestName(title);
        const videoUrl = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;

        if (!contestName) continue;

      console.log(contestName)
        const contest = await Contest.findOne({ name: contestName });

        if (contest) {
           
            contest.pcdLink=videoUrl;
            await contest.save();
        } else {
            console.log(`No matching contest found for: ${contestName}`);
        }
    }
}

export default processVideos;