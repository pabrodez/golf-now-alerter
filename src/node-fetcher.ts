import { format } from "date-fns";
import fetch from "node-fetch";

import { vars } from './data'

import { getPreferredDaysFromInterval, transformTtimeResponse, TeeTime } from "./helpers";

const targetDates = getPreferredDaysFromInterval(vars.preferredDaysWeek, vars.daysOut)

export async function fetcher(): Promise<TeeTime[]> {
    const clientDate = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00.000Z'
    let teeTimes: TeeTime[] = [];
    for (const course of vars.courseIds) {
        for (const date of targetDates) {

            const response = await fetch("https://www.golfnow.co.uk/api/tee-times/tee-time-results", {
                // credentials: "include",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Accept-Language": "en-GB,en;q=0.5",
                    "Content-Type": "application/json; charset=utf-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                // "referrer": "https://www.golfnow.co.uk/tee-times/facility/12090-halifax-west-end-golf-club/search",
                "body": `{\"Radius\":25,\"Latitude\":53.4517675543836,\"Longitude\":-2.3174301851923,\"PageSize\":30,\"PageNumber\":0,\"SearchType\":1,\"SortBy\":\"Date\",\"SortDirection\":0,
                \"Date\":\"${date}\",\"BestDealsOnly\":false,\"PriceMin\":0,\"PriceMax\":10000,\"Players\":0,\"Holes\":3,\"RateType\":\"all\",\"TimeMin\":10,\"TimeMax\":42,
                \"FacilityId\":${course},\"SortByRollup\":\"Date.MinDate\",\"View\":\"Grouping\",\"ExcludeFeaturedFacilities\":true,\"TeeTimeCount\":10,
                \"CurrentClientDate\":\"${clientDate}\"}`,
                "method": "POST",
                // "mode": "cors"
            });
            const text = await response.text()
            const formattedArr = transformTtimeResponse(text)
            if (formattedArr.length !== 0) {
                teeTimes.push(...formattedArr)
            }
        }
        // space out requests
        setTimeout(() => { }, 1000 * 60 * 5)
    }
    return teeTimes
}