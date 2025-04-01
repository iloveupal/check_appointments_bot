
import puppeteer from "puppeteer";
import { debug } from './config.js';
import { log_info } from "./log.js";

async function normalizePage(page) {
    log_info('Normalize page: reload & goto');
    await page.reload();
    await page.goto('https://app.cituro.com/booking/bev#step=1', { waitUntil: 'networkidle2' });

    // Wait for page to fully load with service options
    log_info('Normalize page: waiting for buttons');
    await page.waitForSelector('button.add-toggle', { timeout: 3000 });

    const minusButton = await page.evaluateHandle(() => document.querySelector('button.add-toggle[active]'));

    if (minusButton && minusButton.click) { minusButton.click(); };
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
            console.log(`Could not find ${locationName} on the page`);
            return false;
        }

        console.log('WAITING for GroupEventSuggestionWidget');
        await page.waitForSelector('.GroupEventSuggestionWidget', { timeout: 5000 });


        const appointments = await page.evaluate(() => {
            const dateButton = Array.from(document.querySelectorAll('.GroupEventSuggestionWidget'));
            return dateButton.length;
        });

        return appointments;
    } catch (error) {
        console.error(`Error checking ${locationName}:`, error);
        return false;
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
export async function checkAppointments() {
    log_info('Starting appointment checker...');

    let foundAppointments = [];

    const checkFor = ['PHS', 'trainerlisten'];

    // Launch browser and open new page
    const browser = await puppeteer.launch({
        headless: !debug,
        defaultViewport: null
    });
    const page = await browser.newPage();

    try {
        // Navigate to the booking page
        console.log('Navigating to booking page...');
        await normalizePage(page);

        // ======== Check PHS ========
        console.log('Checking PHS appointments...');
        const phsAvailable = await checkLocationAppointments(page, 'PHS');
        // ======== Check Sportforum Halle 2 ========
        console.log('Checking Sportforum Halle 2 appointments...');
        await normalizePage(page);
        const sportforumAvailable = await checkLocationAppointments(page, 'trainerlisten');

        // Report results
        console.log('\n===== RESULTS =====');
        console.log(`PHS: ${phsAvailable ? 'Appointments AVAILABLE!' : 'No appointments available'}`);
        console.log(`Sportforum Halle 2: ${sportforumAvailable ? 'Appointments AVAILABLE!' : 'No appointments available'}`);

        if (phsAvailable || sportforumAvailable) {
            console.log('\n🎉 APPOINTMENTS FOUND! Check the website to book.');
            phsAvailable && foundAppointments.push('PHS');
            sportforumAvailable && foundAppointments.push('SPORTFORUM');
        } else {
            console.log('\nNo appointments available at this time.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
        return foundAppointments;
    }
}

