import { Telegraf } from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"
import { filterNewTTimes, filterTeeTimes, TeeTime, teeTimesToKeyboard } from "../utils/helpers"
import { gatherTeeTimes } from "../service/watcher"

export async function sendNewTeeTimes(
    ctx: TelegrafContext,
    ttimesProxy: { last: TeeTime[], new: TeeTime[] }
) {

    const teeTimes = await gatherTeeTimes()
    const filtered = filterTeeTimes(teeTimes)
    ttimesProxy.last = filtered
    const keyboard = teeTimesToKeyboard(ttimesProxy.new)

    try {
        await ctx.reply(
            '🏌🏽Tee times🏌🏽',
            {
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: true,
                reply_markup: keyboard
            })

    } catch (error) {
    }
}
