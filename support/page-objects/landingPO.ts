import {Page} from '@playwright/test';
import {SearchPO} from './searchPO';
import {formatDateRangeToDatePicker, generateTravelDates, nextDate} from '../helpers/utils';


export class LandingPO extends SearchPO {

    /**
     * @description Set travel dates, and return the value (to be use later on the assertion)
     * @param {Page} page
     * @param {number} inXDays - book a hotel in X days from today (default: 2 weeks)
     * @param {number} weekDayIndex - index 0-6 (sunday - saturday)
     * @return {{date: string, start: {weekDay: string, day: string, month: string, year: string},
     * end: {weekDay: string, day: string, month:string, year: string}}} travelDates
     */
    override setTravelDates = async (page: Page, inXDays: number = this.travelDatesDefault['bookAHotelIn14Days'],
                                     weekDayIndex: number = this.travelDatesDefault['defaultWeekDayIndex']): Promise<{
        date: string;
        start: {
            weekDay: string,
            day: string,
            month: string,
            year: string
        };
        end: {
            weekDay: string,
            day: string,
            month: string,
            year: string,
        };
    }> => {
        const startTravelDate = (await generateTravelDates(inXDays)).start;
        const firstWeekDayAfterStartingDate = await nextDate(startTravelDate, weekDayIndex);
        const endDate = new Date(firstWeekDayAfterStartingDate);
        endDate.setDate(endDate.getDate() + 1);

        //Click on the field to enter the travel dates
        await page.getByText('Ihre Reisedaten').click();
        const travelDates = await formatDateRangeToDatePicker(firstWeekDayAfterStartingDate, endDate);
        const nextMonthCaption = await page
            .locator(`${this.searchFormOneLine.datePickerElements.calendarEnd} ${this.searchFormOneLine.datePickerElements.monthCaption}`)
            .textContent();
        let currentMonth = await page
            .locator(`${this.searchFormOneLine.datePickerElements.calendarStart} ${this.searchFormOneLine.datePickerElements.monthCaption}`)
            .textContent();

        //Set start travel date, if the month is not the: "previous" (first shown),
        // first click on next mont, and then set the date in "previous" since now is the current
        const travelDatesStartMonthCaption = `${travelDates.start.month} ${travelDates.start.year}`;
        if (travelDatesStartMonthCaption === nextMonthCaption) {
            await page.locator(this.searchFormOneLine.datePickerElements.nextMonth).click();
            currentMonth = nextMonthCaption;
        }
        await page
            .locator(`${this.searchFormOneLine.datePickerElements.calendarStart}`)
            .getByRole('row')
            .getByRole('button', {name: travelDates.start.day.toString(), exact: true})
            .click({delay: 3000});

        //Set end travel date, if the month match the: "previous" (first shown),
        // set the date in that month, else use the "next" month
        const travelDateEndMonthCaption = `${travelDates.end.month} ${travelDates.end.year}`;
        if (travelDateEndMonthCaption === currentMonth) {
            await page
                .locator(`${this.searchFormOneLine.datePickerElements.calendarStart}`)
                .getByRole('row')
                .getByRole('button', {name: travelDates.end.day.toString(), exact: true})
                .click();
        } else {
            await page
                .locator(`${this.searchFormOneLine.datePickerElements.calendarEnd}`)
                .getByRole('row')
                .getByRole('button', {name: travelDates.end.day.toString(), exact: true})
                .click();
        }
        return travelDates;
    };

    /**
     * @description Click on the find hotel button "Hotels finden"
     * @param {Page} page
     */
    override clickOnFindHotelsButton = async (page: Page) => {
        await page.getByRole('button', {name: 'Hotels finden'}).click();
    };

    /**
     * @description Click on the hotel button "Suchen"
     * @param {Page} page
     */
    clickOnSuchenHotelsButton = async (page: Page) => {
        await page.getByRole('button', { name: 'Suchen' }).click({delay: 5000});
    };

    /**
     * @description Visit a LP given url
     * @param {Page} page - Playwright page
     * @param {string} lpURL - landingpage url
     * @return {Promise<void>}
     */
    visitLandingPage = async (page: Page, lpURL: string): Promise<void> => {
        await page.goto(lpURL);
    };

}
