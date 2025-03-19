import cron from "node-cron";
import { fetchCodeChefContests, fetchCodeforcesContests, fetchLeetcodeContestsPuppeteer } from "./services/scrapper.js";

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

cron.schedule("0 */12 * * *", () => {
    console.log("Starting scheduled contest scraping...");
    scrapeContests();
});

export default scrapeContests
