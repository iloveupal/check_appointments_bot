
import puppeteer from "puppeteer";
import { debug } from './config.js';
import { log_info } from "./log.js";

async function normalizePage(page) {
    await page.goto('https://app.cituro.com/booking/bev#step=1', { waitUntil: 'networkidle2' });

    // await page.waitForSelector('button.add-toggle', { timeout: 3000 });

    return page;
}

/**
 * Check for appointments at a specific location
 * @param {Page} page - Puppeteer page object
 * @param {string} locationName - Name of the location to check
 * @returns {boolean} - True if appointments are available, false otherwise
 */
async function checkLocationAppointments(page, locationName) {
    try {
        await page.waitForSelector('.ServiceEntryView', { timeout: 5000 });

        // Find and click the location's add-toggle button
        const locationFound = await page.evaluate((name) => {
            // Look for rows containing the location name
            const rows = Array.from(document.querySelectorAll('.ServiceEntryView')).filter(el =>
                el.textContent && el.textContent.toLocaleLowerCase().includes(name.toLocaleLowerCase())
            );

            if (rows.length > 0) {
                rows[0].click();
                return true;
            }
            return false;
        }, locationName);

        if (!locationFound) {
            log_info(`Could not find ${locationName} on the page`);
            return false;
        }

        await page.waitForNavigation();

        const appointments = await page.evaluate(() => {
            const dateButton = Array.from(document.querySelectorAll('.GroupEventSuggestionWidget'));
            return dateButton.length;
        });

        return appointments;
    } catch (error) {
        throw error;
    }
}

/**
 * Script to check for available appointments at Sportforum Halle 2 and PHS
 * This script will:
 * 1. Open the booking page
 * 2. Check for appointments at []
 * 3. Go back to main page
 * 4. Report the results
 */
export async function checkAppointments(venues) {
    log_info('Starting appointment checker...');

    const browser = await puppeteer.launch({
        headless: !debug,
        defaultViewport: null
    });

    try {
        const results = await Promise.all(venues.map(async (location) => ({ result: await checkLocationAppointments(await normalizePage(await browser.newPage()), location), location })));
        const resultsFiltered = results.filter(({ result }) => result);

        if (resultsFiltered.length) {
            log_info('\n🎉 APPOINTMENTS FOUND! Check the website to book.');
        } else {
            log_info('\nNo appointments available at this time.');
        }

        return resultsFiltered;
    } catch (error) {
        throw error;
    } finally {
        log_info('finally executes anyway');
        await browser.close();
    }
}
