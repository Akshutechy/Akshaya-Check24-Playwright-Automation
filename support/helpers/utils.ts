import {addDays, format} from 'date-fns';
import {Page} from '@playwright/test';


/**
 * @description Waiting time in milliseconds. (Avoid magic numbers)
 */
export const waitingTime = {
    oneSecond: 1000,
    twoSeconds: 2000,
    threeSeconds: 3000,
    fiveSeconds: 5000,
    tenSeconds: 10000,
    threeMinutes: 180000
};

/**
 * @description Generate travel dates
 * @param {number} startDateInDays
 * @return {Promise<{start:string, end:string}>}
 */
export const generateTravelDates = async (startDateInDays: number): Promise<{
    start: string,
    end: string
}> => {
    const travelDuration = 1;
    const dateStart = format(addDays(new Date(), startDateInDays), 'yyyy-MM-dd');
    const dateEnd = format(addDays(new Date(), startDateInDays + travelDuration), 'yyyy-MM-dd');
    return {start: dateStart, end: dateEnd};
};

/**
 * @description Generate a start date given an entry date and week day, for example: first "saturday(6)" after "2023-06-16"
 * @param {Date} dateFrom - starting date (2 weeks from the current date)
 * @param {number} dayIndex (0|1|2|3|4|5|6) -> sunday(0)...saturday(6)
 */
export const nextDate = async (dateFrom: string, dayIndex: number) => {
    const oneWeek = 7;
    const date = new Date(dateFrom);
    date.setDate(date.getDate() + (dayIndex - 1 - date.getDay() + oneWeek) % oneWeek + 1);
    return date;
};

/**
 * @description Format dates with custom format for the search
 * @param {Date} start
 * @param {Date} end
 */
export const formatDateRangeToDatePicker = async (start: Date, end: Date) => {
    // DateTimeFormat.format with specific options
    const customFormat = new Intl.DateTimeFormat('de', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'Europe/Berlin'
    });
    const full = new Intl.DateTimeFormat('de', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Berlin'
    });
    const fullDate = `${(customFormat.format(start)).toString().replace(',', '')} - ${(customFormat.format(end)).toString().replace(',', '')}`;
    const travelStart = {
        weekDay: full.formatToParts(start)[0].value.replace('.', '').trim(),
        day: full.formatToParts(start)[numbers.two].value,
        month: full.formatToParts(start)[numbers.four].value,
        year: full.formatToParts(start)[numbers.six].value
    };
    const travelEnd = {
        weekDay: full.formatToParts(end)[0].value.replace('.', '').trim(),
        day: full.formatToParts(end)[numbers.two].value,
        month: full.formatToParts(end)[numbers.four].value,
        year: full.formatToParts(end)[numbers.six].value
    };
    return {date: fullDate, start: travelStart, end: travelEnd};
};

/**
 * @description Numbers to avoid magic numbers
 * @type {{minusTwo: number,sixty: number, six: number, four: number, two: number}}
 */
export const numbers:
    { minusTwo: number; sixty: number; six: number; four: number; two: number; ten: number } = {
    minusTwo: -2,
    two: 2,
    four: 4,
    six: 6,
    ten: 10,
    sixty: 60
};


/**
 * @description Scroll to Bottom of the Page slowly
 * @param {Page} page
 */
export const scrollToBottom = async (page: Page) => {
    await waitForPageToLoadInSeconds(page,waitingTime.threeSeconds);
    await page.evaluate(async () => {
        const portionHeight = 400; // Adjust the portion height as needed
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        let lastScrollHeight = 0;

        do {
            const initialScrollHeight = window.document.documentElement.scrollHeight;
            window.scrollTo(0, window.scrollY + portionHeight);
            await delay(300); // Adjust the delay time as needed

            if (window.scrollY === lastScrollHeight) {
                break; // Break the loop if scroll height doesn't change
            }

            lastScrollHeight = window.scrollY;
        } while (true); // Continue the loop until explicitly broken
    });
};

/**
 * @description Wait For Page to Load for mentioned duration
 * @param {Page} page
 * @param {number} waitTime
 */
export const waitForPageToLoadInSeconds = async (page: Page, waitTime:number) => {
    await page.waitForTimeout(waitTime);
};
