import puppeteer from 'puppeteer-extra'
import fetch from "node-fetch";
import Contest from "../models/contest.model.js";
import StealthPlugin from "puppeteer-extra-plugin-stealth"

puppeteer.use(StealthPlugin());
async function fetchLeetcodeContestsPuppeteer() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();


    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");

    // Set other headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });

    page.on("console", msg => console.log("PAGE LOG:", msg.text()));

    await page.goto("https://leetcode.com/contest/", { waitUntil: "networkidle2", timeout: 50000 });

    await page.waitForSelector(".swiper-slide", { timeout: 1500000 });

    const contests = await page.evaluate(() => {
        console.log("Reached: Extracting contests"); 

        return Array.from(document.querySelectorAll(".swiper-slide")).map(card => {
            const titleElem = card.querySelector(".truncate");
            const linkElem = card.querySelector("a");
            const timeElem = card.querySelector(".text-label-2");
        if(timeElem){
            return {
                name: titleElem ? titleElem.textContent.trim() : "Unknown",
                url: linkElem ? "https://leetcode.com" + linkElem.getAttribute("href") : "#",
               
                start_time: timeElem ? timeElem.textContent.trim() : "Unknown",
                duration:"01:30",
                platform:"Leetcode"
            };
        }
        });
    });


    contests.forEach(contest => {
        if(contest!=null){
        contest.start_time = convertLeetCodeTimeToDate(contest.start_time);
        }
    });


    for (const contest of contests) {
        if(contest!=null){
        try {
            await Contest.findOneAndUpdate(
                { name: contest.name },
                { $set: contest },
                { upsert: true, new: true }
            );
            console.log(`Upserted: ${contest.name}`);
        } catch (error) {
            console.error(`Error upserting contest ${contest.name}:`, error);
        }
    }
    }

    await browser.close();
    return contests;
}





async function fetchCodeChefContests() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");

    // Set other headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });


    await page.goto("https://www.codechef.com/contests", { waitUntil: "networkidle2", timeout: 5000000 });
    
    const contests = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._flex__container_7s2sw_528")).map(contest => {
            const titleElement = contest.querySelector("a span");
            const urlElement = contest.querySelector("a");
            const timeElements = contest.querySelectorAll("._timer__container_7s2sw_590 p");
            if(timeElements.length === 2){
            return {
                name: titleElement ? titleElement.textContent.trim() : null,
                url: urlElement ? urlElement.href : null,
                starts_in: timeElements.length === 2 ? `${timeElements[0].textContent.trim()} ${timeElements[1].textContent.trim()}` : null,
                duration:"02:00",
                platform:"Codechef"
            };
        }
        });
    });

    await browser.close();

    contests.forEach(contest => {
        if(contest!=null){
        contest.start_time = convertRelativeTimeToDate(contest.starts_in);
        delete contest.starts_in; 
        }
    });

    for (const contest of contests) {
        if(contest!=null){
        try {
            await Contest.findOneAndUpdate(
                { name: contest.name },
                { $set: contest },
                { upsert: true, new: true }
            );
            console.log(`Upserted: ${contest.name}`);
        } catch (error) {
            console.error(`Error upserting contest ${contest.name}:`, error);
        }
    }
    }

    return contests;
}




async function fetchCodeforcesContests() {
    const url = "https://codeforces.com/api/contest.list";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== "OK") {
            throw new Error("Failed to fetch contests");
        }
        
        const upcomingContests = data.result
        .filter(contest => contest.phase === "BEFORE") 
        .map(contest => ({
            name: contest.name,
            url: `https://codeforces.com/contest/${contest.id}`,
            start_time: new Date(contest.startTimeSeconds * 1000), 
            durationSeconds: contest.durationSeconds,
            platform:"Codeforces"
            }));

        upcomingContests.forEach(contest => {
            if (contest != null) {
                contest.duration = convertDurationToHHMM(contest.durationSeconds);
                delete contest.durationSeconds; 
            }
        });
        
       
        for (const contest of upcomingContests) {
            if(contest!=null){
            try {
                await Contest.findOneAndUpdate(
                    { name: contest.name },
                    { $set: contest },
                    { upsert: true, new: true }
                );
                console.log(`Upserted: ${contest.name}`);
            } catch (error) {
                console.error(`Error upserting contest ${contest.name}:`, error);
            }
        }
        }

        return upcomingContests;
    } catch (error) {
        console.error("Error fetching Codeforces contests:", error);
        return [];
    }
}


function convertLeetCodeTimeToDate(startTimeString) {
    const regex = /(\w+)\s(\d{1,2}:\d{2}\s[APM]+)\sGMT([+-]\d{1,2}:\d{2})/;
    const match = startTimeString.match(regex);

    if (!match) return null; 

    const [_, day, time, offset] = match;

   
    const date = new Date();
    date.setHours(...parseTime(time), 0, 0);

   
    date.setDate(date.getDate() + ((getDayIndex(day) - date.getDay() + 7) % 7));

    
    const [offsetHours, offsetMinutes] = offset.split(":").map(Number);
    const offsetMs = (offsetHours * 60 + offsetMinutes) * 60 * 1000;

 
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000 - offsetMs);
}

function parseTime(timeString) {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return [hours, minutes];
}

function getDayIndex(day) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
}

function convertRelativeTimeToDate(relativeTime) {
    if (!relativeTime) return null;

    const match = relativeTime.match(/(\d+)\sDays\s(\d+)\sHrs/);
    if (!match) return null;

    const days = parseInt(match[1], 10);
    const hours = parseInt(match[2], 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + days);
    startDate.setHours(startDate.getHours() + hours);

    return startDate;
}

function convertDurationToHHMM(durationSeconds) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}



export { fetchLeetcodeContestsPuppeteer, fetchCodeChefContests, fetchCodeforcesContests };
