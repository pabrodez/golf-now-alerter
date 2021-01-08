import { watcher } from "./service/watcher"
import { Telegraf } from "telegraf"
import {
    filterNewTTimes,
    millisecToStartDateTime,
    TeeTime
} from "./utils/helpers"
import { vars } from './data'
import { sendNewTeeTimes } from "./handlers/refresh"
require('dotenv').config()


async function main() {
    // last is last batch of teetimes fetched and new is tee times
    // found in this last fetch but not found in the previous fetch tee times
    let teeTimesObj: { last: TeeTime[], new: TeeTime[] } = { last: [], new: [] }
    // move the logic of filtering new teetimes to the proxy
    let teeTimesProxy = ((ttObj: { last: TeeTime[], new: TeeTime[] }) => {
        const handler = {
            set(obj: typeof ttObj, prop: keyof typeof ttObj, value: TeeTime[]) {
                if (prop === 'last') {
                    obj['new'] = filterNewTTimes(obj['last'], value)
                }
                obj[prop] = value;
                return true;
            }
        }
        return new Proxy(ttObj, handler)
    })(teeTimesObj);

    const bot = new Telegraf(process.env.BOT_TOKEN)
    bot.catch((err: Error) => {
        bot.telegram.sendMessage(process.env.CHAT_ID, 'Error')
        console.error('Error: ', err.message, '\nMaybe check bot token')
    })
    bot.command('refresh', async (ctx) => {
        await sendNewTeeTimes(ctx, teeTimesProxy)
    })

    bot.launch()

    watcher(bot, teeTimesProxy)

    setTimeout(async () => {
        await watcher(bot, teeTimesProxy)
        setInterval(async () => {
            await watcher(bot, teeTimesProxy)
        }, 1000 * 60 * 60 * 24 * Number(vars.days))
    }, millisecToStartDateTime())
}

main()