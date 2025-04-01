import { venues } from './config.js';
import { checkAppointments } from './check_appointments.js';
import { log_important, log_info } from './log.js';
import { sendTelegramNotification } from './telegram.js';

async function runJob() {
    try {
        log_info(venues);
        const foundAppointments = await checkAppointments(venues);

        log_info(foundAppointments);

        foundAppointments.length ? await sendTelegramNotification(
            `Found Appointments: ${foundAppointments.map(({location}) => location).join(', ')}`
        ) : log_info('no appointments found, exiting');
    } catch (e) {
        log_important(e);
        process.exit(1);
    }
}

runJob();
