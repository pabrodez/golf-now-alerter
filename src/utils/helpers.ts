import {
    addDays, getDay, format,
    eachDayOfInterval, parseJSON, setMinutes,
    setHours, differenceInMilliseconds
} from 'date-fns'
import { vars } from "../data";
import { Telegraf, Markup } from 'telegraf'
import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';
import { UrlButton } from 'telegraf/typings/markup';
import { TelegrafContext } from 'telegraf/typings/context';

export interface TeeTime {
    courseName: string;
    minRate: string;
    maxRate: string;
    date: string;
    time: string;
    detailUrl: string;
}

export const millisecToStartDateTime = (): number => {
    const now = new Date()
    const newDate = setMinutes(setHours(now, vars.hourDay), vars.minuteDay)
    const difference = differenceInMilliseconds(newDate, now)
    const milisecsToStart = difference < 0 ? differenceInMilliseconds(addDays(newDate, 1), now) : difference;
    return milisecsToStart
}

export const getPreferredDaysFromInterval = (prefDays: number[], daysFromNow: number): string[] => {
    const start = new Date()
    const end = addDays(start, daysFromNow)
    const interval: Interval = { start, end }
    const output: string[] = eachDayOfInterval(interval)
        .reduce((acc, day) => {
            prefDays.includes(getDay(day)) && acc.push(format(day, 'MMM dd yyyy'));
            return acc;
        }, [])
    return output
}

export const parseTtimeResponse = (respText: string): TeeTime[] => {
    if (/"teeTimes": \[\]/.test(respText)) return []; // teetimes prop is empty    
    const parsed: any = JSON.parse(respText)
    const arrTts = parsed.ttResults.teeTimes
    return arrTts.map((tt: { facility: { name: any }; minTeeTimeRate: any; maxTeeTimeRate: any; time: any; detailUrl: any }) => ({
        courseName: tt.facility.name,
        minRate: tt.minTeeTimeRate,
        maxRate: tt.maxTeeTimeRate,
        date: format(parseJSON(tt.time), 'EEE dd-MM'),
        time: format(parseJSON(tt.time), 'kk:mm'),
        detailUrl: tt.detailUrl,
    }))
}

export const filterTeeTimes = (ttimes: TeeTime[]): TeeTime[] => {
    return ttimes.filter(tt => vars.filters.reduce((acc, curr) => curr(tt) && acc, true));
}

export function teeTimesToKeyboard(ttimes: TeeTime[]): Markup & InlineKeyboardMarkup {
    const buttons: UrlButton[] = ttimes.map((ttime) => {
        return Markup.urlButton(`📅${ttime.date} ${ttime.time}🏷️£${ttime.minRate}⛳${ttime.courseName.slice(0, 5)}`,
            vars.golfNowUrl + ttime.detailUrl)
    })
    const options = { columns: 1 }
    return Markup.inlineKeyboard(buttons, options)
}

export async function sendTTimesAlert(bot: Telegraf<TelegrafContext>, ttimes: TeeTime[]) {

    const keyboard = teeTimesToKeyboard(ttimes)

    try {
        await bot.telegram.sendMessage(process.env.CHAT_ID,
            '🏌🏽Tee times🏌🏽',
            {
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: true,
                reply_markup: keyboard
            })

    } catch (error) {
    }
}

export function filterNewTTimes(previous: TeeTime[], newest: TeeTime[]): TeeTime[] {
    if (previous.length === 0) return newest;
    return newest
        .filter(newTt => {
            !previous.some(oldTt => (
                oldTt.date === newTt.date
                && oldTt.time === newTt.time
                && oldTt.courseName === newTt.courseName
            ))  // maybe just compare detailUrl
        })
}

// const pipe = (funcs: ((s: string) => any)[], arg: string) => funcs.reduce((prev, curr) => curr(prev), arg)

// const formatDataToSend = (ttimes: TeeTime[]): string => {
//     let ttRows: string[] = []

//     const uniqueDates = new Set(ttimes.map(tt => tt.date))
//     for (const date of uniqueDates) {
//         let dateTtimes: TeeTime[] = []
//         ttimes.forEach(tt => tt.date === date && dateTtimes.push(tt))
//         const dayRows: string[] = dateTtimes
//             .map(tt => `${tt.date} | ${tt.time} | £${tt.minRate} | [${tt.courseName.slice(0, 5)}](${vars.golfNowUrl + tt.detailUrl})`
//                 .replace(/\-|\.|\|/g, "\\$&"))
//         ttRows.push(...dayRows)
//     }
//     return ttRows.join('\n')
// }