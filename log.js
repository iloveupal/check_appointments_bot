import { debug } from './config.js';

export const log_info = (...messages) => {
    if (debug) {
        console.log(...messages);
    }
}

export const log_important = (...messages) => {
    console.log(...messages);
}
