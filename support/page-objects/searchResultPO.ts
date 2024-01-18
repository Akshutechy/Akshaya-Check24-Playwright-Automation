import { Page } from '@playwright/test';
import {waitingTime,waitForPageToLoadInSeconds} from '../helpers/utils';


export class SearchResultPO {

    private get lowestPriceButton(): string {
        return 'Niedrigster Preis';
    }

    private get hotelPriceText(): string {
        return '//div[contains(@class,"hotelResultTotalPrice")]/a';
    }

    /**
     * @description Click on the Lowest Price button
     * @param {Page} page
     */
    clickOnLowestPriceButton = async (page: Page) => {
        await page.getByText(this.lowestPriceButton).click({ delay: 3000 });
        await waitForPageToLoadInSeconds(page,waitingTime.threeSeconds);
    };

    /**
     * @description Get the Array of Hotel Prices Text
     * @param {Page} page
     */
    getHotelPriceText = async (page: Page) => {
        return await this.getTextArray(page, this.hotelPriceText);
    };

    /**
     * @description Common method which will return the Array of Text for the input locator
     * @param {Page} page
     * @param {string} locator
     */
    private getTextArray = async (page: Page, locator: string): Promise<string[]> => {
        return page.locator(locator).allTextContents();
    };

    /**
     * @description Will return "True" if the Input Array is Sorted. Else will return "False"
     * @param {boolean} inputArray
     */
    isArraySorted(inputArray: any[]): boolean {
        this.processArray(inputArray);
        return inputArray.every((value, index, array) => index === 0 || value >= array[index - 1]);
    }

    /**
     * @description Common method which will process on Input Array to remove the Euro Symbol and also Reduces Array size with 5 elements
     *  @param { string[]} inputArray
     */
    private processArray = (inputArray: string[]): string[] => {
        const processedArray = inputArray
            .map(item => item.replace(/[\s€]/g, '').trim()) // Remove Euro symbol and trim spaces
            .slice(0, 5); // Save only the first 5 elements
        return processedArray;
    };
}
