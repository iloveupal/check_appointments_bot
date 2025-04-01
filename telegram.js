import axios from 'axios';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './config.js';
import { log_info } from './log.js';

export async function sendTelegramNotification(message) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    log_info('message', message);
    
    const response = await axios.post(telegramUrl, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
    });

    if (response.data.ok) {
        log_info('Telegram notification sent successfully!');
        return true;
    } else {
        throw new Error(`Failed to send a tg notification`);
    }
}