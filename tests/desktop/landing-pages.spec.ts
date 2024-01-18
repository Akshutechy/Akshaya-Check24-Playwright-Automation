import { HomePO } from '../../support/page-objects/homePO';
import { LandingPO } from '../../support/page-objects/landingPO';
import { SearchResultPO } from '../../support/page-objects/searchResultPO';
import { expect, test } from '@playwright/test';
import { scrollToBottom } from '../../support/helpers/utils'

test.describe('Feature: Landing Pages, @desktop, @lp', () => {

    const homePO: HomePO = new HomePO();
    const landingPO: LandingPO = new LandingPO();
    const searchResultPO: SearchResultPO = new SearchResultPO();

    //Test Data
    const expectedDestination1 = 'Berlin';
    const query1 = 'ber';

    const expectedDestination2 = 'München';
    const query2 = 'mun';

    test.beforeEach(async ({ page }) => {
        await homePO.setCookie(page, 'c24consent', 'fam');
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });


    test('Landing Page Deutschland: Search as a guest for the lowest price offers in Berlin and make sure the first five offers are the cheapest hotel deals , @smoke',
        async ({ page }) => {
            //Navigate to the page
            await landingPO.visitLandingPage(page, "https://hotel.check24.de/lp/Deutschland/10");

            //Fill the search box and submit
            await landingPO.deleteDefaultSearchDestination(page);
            await landingPO.fillInDestinationSearchBox(page, query1);
            await landingPO.selectFirstDestinationFromAutocompleteList(page, expectedDestination1);
            await landingPO.setTravelDates(page, 15, 6);
            await landingPO.clickOnSuchenHotelsButton(page);

            //Wait for page load and select lowest price filter
            await scrollToBottom(page);
            await searchResultPO.clickOnLowestPriceButton(page);

            //Filter out the price of the first five hotel results
            const allHotelPriceTextArray = await searchResultPO.getHotelPriceText(page);

            //Assert that they are sorted ascending by price
            expect(searchResultPO.isArraySorted(allHotelPriceTextArray)).toBeTruthy();
        });

    test('Landing Page Bayern: Search as a guest for the lowest price offers in Munich and make sure the first five offers are the cheapest hotel deals, @smoke',
        async ({ page }) => {
            //Navigate to the page
            await landingPO.visitLandingPage(page, "https://hotel.check24.de/region/germany/bavaria-398601");

            //Fill the search box and submit
            await landingPO.deleteDefaultSearchDestination(page);
            await landingPO.fillInDestinationSearchBox(page, query2);
            await landingPO.selectFirstDestinationFromAutocompleteList(page, expectedDestination2);
            await landingPO.setTravelDates(page, 15, 6);
            await landingPO.clickOnSuchenHotelsButton(page);

            //Wait for page load and select lowest price filter
            await scrollToBottom(page);
            await searchResultPO.clickOnLowestPriceButton(page);

            //Filter out the price of the first five hotel results
            const allHotelPriceTextArray = await searchResultPO.getHotelPriceText(page);

            //Assert that they are sorted ascending by price
            expect(searchResultPO.isArraySorted(allHotelPriceTextArray)).toBeTruthy();
        });
});
