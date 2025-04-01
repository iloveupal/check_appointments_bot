import axios from 'axios';
import './config.js';
import { checkAppointments } from './check_appointments.js';
import { log_important, log_info } from './log.js';

async function sendTelegramNotification(message, token, userId) {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    log_info('message', message);
    
    const response = await axios.post(telegramUrl, {
        chat_id: userId,
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


async function runJob() {
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            throw new Error(`ENV hasn't been properly setup`);
        }

        const foundAppointments = await checkAppointments();

        log_info(foundAppointments);

        foundAppointments.length ? await sendTelegramNotification(
            `Found Appointments: ${foundAppointments.join(', ')}`,
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID
        ) : log_info('no appointments found, exiting');
    } catch (e) {
        log_important(e);
        process.exit(1);
    }
}

runJob();
