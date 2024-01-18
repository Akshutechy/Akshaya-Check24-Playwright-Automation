import {Page} from '@playwright/test';
import {formatDateRangeToDatePicker, generateTravelDates, nextDate, waitingTime} from '../helpers/utils';
import * as process from 'process';//NOSONAR

export class SearchPO {
    get guestConfigurationsAddRemoveIndex(): Object {
        return {
            addAdult: 1,
            addChildren: 3,
            addRoom: 5,
            removeAdult: 0,
            removeChildren: 2,
            removeRoom: 4
        };
    }

    get hotelResults(): { ctaCheckAvailability: string; ctaCheckAvailabilityText: string } {
        return {
            ctaCheckAvailability: 'div[class*="ctaContainer"] a',
            ctaCheckAvailabilityText: 'Verfügbarkeit anzeigen'
        };
    }

    get priorityBoostFlags(): { hotelBadgesSelector: string; wellnessSpa: string } {
        return {
            hotelBadgesSelector: 'div[class*="hotelResultBadges"]',
            wellnessSpa: 'Spa & Wellnesscenter'
        };
    }

    get searchFormOneLine(): {
        datePickerElements: {
            calendarEnd: string; calendarStart: string; datesField: string; dayContentButton: string;
            dayPickerTable: string; monthCaption: string; monthNavigation: string; months: string; nextMonth: string;
            previousMonth: string
        }; destination: {
            autocompleteList: string; errorMessage: string; placeHolder: string;
            query: string; queryDestination: string; removeDestinationQuery: string;
            tagPoweredByGoogle: string; shortDescription: string; label: string
        }; findHotelsCTA: string; roomConfigurationElements:
            {
                adults: string;
                baseGuestsRowSelector: string;
                children: string;
                childrenAgeFields: string;
                plusMinusButton: string;
                rooms: string;
                roomsConfigrationFields: string;
                form: string
            }
    } {
        return {
            destination: {
                autocompleteList: 'ul[class*="suggestionList"] li',
                placeHolder: 'Stadt, Region oder Unterkunft',
                errorMessage: 'div[class*="errorMessage"]',
                query: 'span[class*="query"]',
                queryDestination: 'input[name="destinationQueryInput"]',
                removeDestinationQuery: 'div[class*="searchFormField"] div[class*="clearIcon"]',
                tagPoweredByGoogle: 'div[class*="placesHint"]',
                shortDescription: 'div[class*="shortDescription"]',
                label: 'span[class*="label"]'
            },
            datePickerElements: {
                calendarEnd: 'div[class*="rdp-caption_end"]',
                calendarStart: 'div[class*="rdp-caption_start"]',
                datesField: 'div[class*="singleLineDateRange"]',
                dayContentButton: 'button[class*="dayContent"]',
                dayPickerTable: 'table[aria-labelledby*="react-day-picker-"]',
                monthCaption: 'div[class*="caption"]',
                monthNavigation: 'div[class*="navigation"]',
                months: 'div[class*="months"]',
                nextMonth: 'button[name="next-month"]',
                previousMonth: 'button[name="previous-month"]'
            },
            findHotelsCTA: 'div[class*="submitButton"]',
            roomConfigurationElements: {
                adults: 'Erwachsene',
                baseGuestsRowSelector: 'div[class*=field] div[class*=title]',
                children: 'Kinder',
                childrenAgeFields: 'div[class*="childrenAgeFields"] div[class*="field"]',
                plusMinusButton: 'div[class*="plusMinusInput"] button',
                rooms: 'div[class*=field] div[class*=title]',
                roomsConfigrationFields: 'div[class*="roomConfigurationFields"]',
                form: 'div[id="room-configuration-form"]'
            }
        };
    }

    get serpAvailabilityErrorMessage(): string {
        return 'div[class*="levelOfCapacityDisplay"]';
    }
    
    get serpHeadline(): { title: string } {
        return {title: 'div[id="hotelResultsHeader"] h4'};
    }

    get serpSearchFormMenu(): {
        travelDestination: string;
        resultTravelDatesRange: string;
        roomsConfigForm: string;
    } {
        return {
            travelDestination: 'input[name="destinationQueryInput"]',
            //format example: So. 18. Juni
            resultTravelDatesRange: 'div[class*="resultsDateRangeInputs"] div[class*="date"] div[class*="date"]',
            //format example: 6 Gäste | 2 Zimmer
            roomsConfigForm: 'div[id="room-configuration-form"]'
        };
    }

    get travelDatesDefault(): Object {
        return {
            bookAHotelIn14Days: 14, defaultWeekDayIndex: 6
        };
    }

    /**
     * @description Click on the destination search box
     * @param {Page} page
     * @param {number} delayInMilliSec
     * @return {Promise<void>}
     */
    clickOnTheDestinationSearchBox = async (page: Page, delayInMilliSec: number = waitingTime.oneSecond): Promise<void> => {
        await page.waitForSelector(this.searchFormOneLine.destination.queryDestination);
        await page.locator(this.searchFormOneLine.destination.queryDestination).click({delay: delayInMilliSec});
    };

    /**
     * @description Click on the find hotel button "Hotels finden"
     * @param {Page} page
     */
    clickOnFindHotelsButton = async (page: Page) => {
        await page.locator(this.searchFormOneLine.findHotelsCTA).click({force: true});
    };

    /**
     * @description Click on the "X" icon to remove the current search destination
     * @param {Page} page
     */
    deleteDefaultSearchDestination = async (page: Page) => {
        //check if value is empty, then clear the field
        const queryValue = await page.locator(this.searchFormOneLine.destination.queryDestination).getAttribute('value');
        if (queryValue !== '') {
            await page.getByRole('textbox').clear();
        }
    };

    /**
     * @description Add guest: adults configuration
     * @param {Page} page
     * @param {number} adults
     */
    fillInAdultsConfig = async (page: Page, adults: number) => {
        if (adults > 1) {
            //The number of adults is by default 1 (so add number - 1)
            for (let i = 1; i < adults - 1; i++) {
                await page
                    .locator(this.searchFormOneLine.roomConfigurationElements.plusMinusButton)
                    .nth(this.guestConfigurationsAddRemoveIndex['addAdult'])
                    .click();
            }
            //@TODO Add logic to test adults => 5, with room config.
        }
    };

    /**
     * @description Fill in guest configuration for children and age
     * @param {Page} page
     * @param {number} children
     * @param {Array<string>} age - example: ['0 Jahre','1 Jahr']
     */
    fillInChildrenConfig = async (page: Page, children: number, age: Array<string>) => {
        if (children > 0) {
            for (let i = 0; i < children; i++) {
                await page
                    .locator(this.searchFormOneLine.roomConfigurationElements.plusMinusButton)
                    .nth(this.guestConfigurationsAddRemoveIndex['addChildren'])
                    .click();
                await page.waitForSelector(this.searchFormOneLine.roomConfigurationElements.childrenAgeFields);
                const childrenFields = page.locator(this.searchFormOneLine.roomConfigurationElements.childrenAgeFields);
                //Click on the label to select the children age
                await childrenFields.nth(i).click();
                //Fill in children age
                await page.getByText(age[i], {exact: true}).click();
            }
        }
    };

    /**
     * @description Search by query (no clear field)
     * @param {string} query
     * @param {number} delayTime - delay while entering a query (for example to load and grab final autosuggestions)
     * @param {Page} page
     */
    fillInDestinationQuery = async (query: string, page: Page, delayTime: number = waitingTime.twoSeconds) => {
        if (process.env.ENVIRONMENT === 'staging') {
            delayTime = waitingTime.fiveSeconds;
        }
        await this.clickOnTheDestinationSearchBox(page);
        await page.locator(this.searchFormOneLine.destination.queryDestination).clear({force: true});
        await page.locator(this.searchFormOneLine.destination.queryDestination).type(query, {delay: delayTime});
    };

    /**
     * @description Search by query
     * @param {Page} page
     * @param {string} query
     * @param {number} delayTime - delay while entering a query (for example to load and grab final autosuggestions)
     */
    fillInDestinationSearchBox = async (page: Page, query: string, delayTime: number = waitingTime.oneSecond) => {
        await page.locator(this.searchFormOneLine.destination.queryDestination).clear({force: true});
        await page.locator(this.searchFormOneLine.destination.queryDestination).type(query, {delay: delayTime});
    };

    /**
     * @description Fill in guests and rooms configuration
     * @param {Page} page
     * @param {{adults: number, children: number, ages: Array<string>}} guests - config (adult, number of children and ages)
     * @param rooms
     */
    fillInGuestsAndRoomsConfiguration = async (
        page: Page,
        guests: {
            adults: number,
            children: number,
            ages: Array<string>
        }, rooms = 1) => {
        await page
            .locator(this.searchFormOneLine.roomConfigurationElements.form)
            .click();
        await this.fillInAdultsConfig(page, guests.adults);
        if (guests.children > 0) {
            await this.fillInChildrenConfig(page, guests.children, guests.ages);
        }
        await this.fillInRoomsConfig(page, rooms);
    };

    /**
     * @description Add guest: adults configuration
     * @param {Page} page
     * @param rooms
     */
    fillInRoomsConfig = async (page: Page, rooms: number) => {
        if (rooms > 1) {
            //The number of adults is by default set to 1 (so add number - 1)
            for (let i = 1; i < rooms - 1; i++) {
                await page
                    .locator(this.searchFormOneLine.roomConfigurationElements.plusMinusButton)
                    .nth(this.guestConfigurationsAddRemoveIndex['addRoom'])
                    .click();
            }
        }
    };


    /**
     * @description Click on the autosuggestion option that match the destination
     * @param {Page} page
     * @param {string} destination
     */
    selectFirstDestinationFromAutocompleteList = async (page: Page, destination: string) => {
        await page
            .locator(this.searchFormOneLine.destination.autocompleteList)
            .filter({hasText: destination})
            .nth(0)
            .click();
    };

    /**
     * @description Set travel dates, and return the value (to be use later on the assertion)
     * @param {Page} page
     * @param {number} inXDays - book a hotel in X days from today (default: 2 weeks)
     * @param {number} weekDayIndex - index 0-6 (sunday - saturday)
     * @return {{date: string, start: {weekDay: string, day: string, month: string, year: string},
     * end: {weekDay: string, day: string, month:string, year: string}}} travelDates
     */
    setTravelDates = async (page: Page, inXDays: number = this.travelDatesDefault['bookAHotelIn14Days'],
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
        await page.locator(this.searchFormOneLine.datePickerElements.datesField).first().click();
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
}
