# 🏌🏽‍♀️ ⛳ Golf Now alerts on Telegram
Get alerts of tee times available in [GolfNow](https://www.golfnow.co.uk/) on your Telegram chat.

## Use:
Once you've [created a Telegram bot](https://core.telegram.org/bots#6-botfather) and got your token, you'll need a chat id.
Go to `https://api.telegram.org/bot(yourToken)/getUpdates`, send a message to your bot from your account, refresh the previous link and check for the id in
`result.message.chat.id`. Copy and paste it in the `.env` file as below.

Download:
```bash
git clone https://github.com/pabrodez/golf-now-alerter
cd golf-now-alerter
npm install
``` 
Create a `.env` file in the root folder:
```bash
BOT_TOKEN=your telegram bot token goes here
CHAT_ID=the chat id to send alerts to
```
Tweak the `data.ts` file:
```javascript
vars = {
    days: 1,  // frequency in days
    hourDay: 10,  // hour of the day to start processing the alert
    minuteDay: 0,  // minute of the day to start processing the alert
    daysOut: 14,  // how many days from now
    preferredDaysWeek: [6, 0], // 0 = sunday, 1 = monday, etc
    priceRange: [0, 25],
    hourRange: [10, 16],  // between what hours of the day (24 hr clock)
    filters: ((tt: TeeTime) => boolean)[], // array of functions that take a TeeTime and return true/false used to filter fetched teetimes (check the examples in data.ts file)
    courseIds: ['12090']  // ids of the courses yo want the info from. This is found in the URL of the golf course at GolfNow website
}
```
Build and run:
```bash
npm run-script build
npm run-script start
```

## TODO:
- [ ] Add commands to stop getting alerts and to resume getting them
- [X] Store previously fetched tee times, so the new tee times can be compared and filtered (flag with "it's new", "price lowered", etc.)
- [X] Add option to specify a range for prices and times