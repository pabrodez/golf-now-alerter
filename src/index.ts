import { fetcher } from "./node-fetcher"
import { Telegraf } from "telegraf"
import { TeeTime, formatDataToSend } from "./helpers"
import { vars } from './data'
import { addDays, differenceInMilliseconds, setHours, setMinutes } from "date-fns"
require('dotenv').config()


async function doYourThing() {
    const bot = new Telegraf(process.env.BOT_TOKEN)
    bot.catch((err: Error) => {
        bot.telegram.sendMessage(process.env.CHAT_ID, 'Error')
        console.error('Error: ', err.message, '\nMaybe check bot token')
    })
    bot.launch()

    try {
        const teeTimes: TeeTime[] = await fetcher()
        const processed = formatDataToSend(teeTimes) || 'Not tee times found'
        await bot.telegram.sendMessage(process.env.CHAT_ID, processed, { parse_mode: 'MarkdownV2' })
    } catch (error) {
        await bot.telegram.sendMessage(process.env.CHAT_ID, 'An error occurred while processing request')
        console.error(error)
    }

}

// figure out when to start 
const now = new Date()
const newDate = setMinutes(setHours(now, vars.hourDay), vars.minuteDay)
const difference = differenceInMilliseconds(newDate, now)
const milisecsToStart = difference < 0 ? differenceInMilliseconds(addDays(newDate, 1), now) : difference;

setTimeout(() => {
    doYourThing()
    setInterval(doYourThing, 1000 * 60 * 60 * 24 * Number(vars.days))
}, milisecsToStart)