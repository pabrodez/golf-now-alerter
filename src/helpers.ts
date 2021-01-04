import {
    addDays,
    getDay,
    format,
    eachDayOfInterval, parseJSON
} from 'date-fns'
import { vars } from "./data";

export interface TeeTime {
    courseName: string;
    minRate: string;    
    maxRate: string;
    date: string;
    time: string;
    detailUrl: string;
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

export const transformTtimeResponse = (respText: string): TeeTime[] => {
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

export const formatDataToSend = (ttimes: TeeTime[]): string => {
    let ttRows: string[] = []

    const uniqueDates = new Set(ttimes.map(tt => tt.date))
    for (const date of uniqueDates) {
        let dateTtimes: TeeTime[] = []
        ttimes.forEach(tt => tt.date === date && dateTtimes.push(tt))
        const dayRows: string[] = dateTtimes
            .map(tt => `${tt.date} | ${tt.time} | £${tt.minRate} | [${tt.courseName.slice(0, 5)}](${vars.golfNowUrl + tt.detailUrl})`
                .replace(/\-|\.|\|/g, "\\$&"))
        ttRows.push(...dayRows)
    }
    return ttRows.join('\n')
}