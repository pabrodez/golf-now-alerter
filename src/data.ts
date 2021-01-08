import { TeeTime } from "./utils/helpers";

interface Vars {
    days: number;
    hourDay: number;
    minuteDay: number;
    daysOut: number;
    preferredDaysWeek: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
    priceRange: [number, number];
    hourRange: [number, number];
    filters: ((tt: TeeTime) => boolean)[],
    golfNowUrl: string;
    courseIds: string[];
}

export const vars: Vars = {
    days: 1,
    hourDay: 10,
    minuteDay: 0,
    daysOut: 14,
    preferredDaysWeek: [6, 0], // 0 = sunday
    priceRange: [0, 25],
    hourRange: [0, 24],
    filters: [
        (tt) => {
            const hour = Number(tt.time.slice(0, 2));
            return hour > Math.min(...vars.hourRange) && hour < Math.max(...vars.hourRange)
        },
        (tt) => {
            const rate = Number(tt.minRate)
            return rate > Math.min(...vars.priceRange) && rate < Math.max(...vars.priceRange)
        }
    ],
    golfNowUrl: 'https://www.golfnow.co.uk',
    courseIds: ['12090', '13619']
}