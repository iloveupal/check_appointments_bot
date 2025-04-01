import { config } from 'dotenv';
config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHECK_VENUES = process.env.CHECK_VENUES;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !CHECK_VENUES) {
    console.error('env not setup correctly');
    process.exit(1);
}

export const debug = process.env.DEBUG;
export const venues = (() => process.env.CHECK_VENUES.split(',').map((x) => x.trim()))();