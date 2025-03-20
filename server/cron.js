import cron from "node-cron";
import { fetchCodeChefContests, fetchCodeforcesContests, fetchLeetcodeContestsPuppeteer } from "./services/scrapper.js";
import processVideos from "./services/pcdScrapper.js";

async function scrapeContests() {
    console.log("Running contest scrapers...");
    
    try {
        await fetchLeetcodeContestsPuppeteer();
        console.log("Leetcode contests scraped successfully.");
    } catch (error) {
        console.error("Error scraping Leetcode contests:", error);
    }

    try {
        await fetchCodeChefContests();
        console.log("CodeChef contests scraped successfully.");
    } catch (error) {
        console.error("Error scraping CodeChef contests:", error);
    }

    try {
        await fetchCodeforcesContests();
        console.log("Codeforces contests scraped successfully.");
    } catch (error) {
        console.error("Error scraping Codeforces contests:", error);
    }
}

const PLAYLISTS = {
    Leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
    CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
    Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB"
};


async function scrapePCDLinks() {
  
    for (const [platform, playlistId] of Object.entries(PLAYLISTS)) {
        await processVideos(platform, playlistId);
       
    }
}


cron.schedule("0 */12 * * *", () => {
    console.log("Starting scheduled contest scraping...");
    scrapeContests();
    scrapePCDLinks();
});

export {scrapeContests,scrapePCDLinks}
