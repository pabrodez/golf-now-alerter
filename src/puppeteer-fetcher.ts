// this is an alternative to using node-fetch
// puppeteer goes to the website and evaluates the fetch command in the browser context

import * as puppeteer from 'puppeteer'
import { format } from "date-fns";

import { vars } from './data'

import { getPreferredDaysFromInterval, formatTtimeResponse, TeeTime } from "./helpers";

export async function fetcher(): Promise<TeeTime[]> {

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let key: string;
    page.once('request', async (resp) => {
        if (resp.url().endsWith('tee-time-results')) {
            key = resp.headers()['__requestverificationtoken']
            console.log(key)
        }
    })
    await page.goto(vars.baseUrl)
    const targetDates = getPreferredDaysFromInterval(vars.preferredDaysWeek, vars.daysOut)
    const clientDate = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00.000Z'

    let teeTimes: TeeTime[] = [];

    for (const course of vars.courseIds) {
        for (const date of targetDates) {
            const ttResponse: string = await page.evaluate(async (key, currentDate, targetDate, facilityId) => {
                const response = await fetch("https://www.golfnow.co.uk/api/tee-times/tee-time-results",
                    {
                        "credentials": "include", "headers": {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36", "Accept": "application/json, text/javascript, */*; q=0.01", "Accept-Language": "en-GB,en;q=0.5", "Content-Type": "application/json; charset=utf-8",
                            "__RequestVerificationToken": key, "X-Requested-With": "XMLHttpRequest", "Cache-Control": "max-age=0"
                        }, "referrer": "https://www.golfnow.co.uk/tee-times/facility/12090-halifax-west-end-golf-club/search",
                        "body": `{\"Radius\":25,\"Latitude\":53.4517675543836,\"Longitude\":-2.3174301851923,
                                \"PageSize\":30,\"PageNumber\":0,\"SearchType\":1,\"SortBy\":\"Date\",\"SortDirection\":0,
                                \"Date\":\"${targetDate}\",\"BestDealsOnly\":false,\"PriceMin\":\"0\",\"PriceMax\":\"10000\",\"Players\":\"0\",\"TimePeriod\":\"3\",\"Holes\":\"3\",\"RateType\":\"all\",\"TimeMin\":\"10\",\"TimeMax\":\"42\",
                                \"FacilityId\":\"${facilityId}\",\"SortByRollup\":\"Date.MinDate\",\"View\":\"Grouping\",\"ExcludeFeaturedFacilities\":true,\"TeeTimeCount\":10,
                                \"CurrentClientDate\":\"${currentDate}\"}`,
                        "method": "POST", "mode": "cors"
                    })
                const text = await response.text()
                return text
            }, key, clientDate, date, course)

            const formattedArr = formatTtimeResponse(ttResponse)
            if (formattedArr.length !== 0) {
                teeTimes.push(...formattedArr)
            }
        }
        // space out requests
        setTimeout(() => { }, 1000 * 60 * 5)
    }

    await browser.close()

    return teeTimes
}