import {Page} from '@playwright/test';

export class HomePO {

    private get anmeldenButton(): string {
        return 'button[data-test-id="login-button"]';
    }

    /**
     * @description Click on the login button
     */
    clickOnLoginFromTheTeaser = async (page: Page) => {
        await page.locator(this.anmeldenButton).click();
    };

    /**
     * @description Set cookie to close the splash screen
     */
    closeSplashScreen = async (page: Page) => {
        await this.setCookie(page, 'hotel_splash', 'true');
    };

    /**
     * @description Set cookies on the page
     * @param {Page} page
     * @param {string} name
     * @param {string} value
     */
    setCookie = async (page: Page, name: string, value: string) => {
        if (page.url() === 'about:blank') {
            await page.goto('/');
        }
        await page.context().addCookies([{
            name,
            value,
            domain: '.check24.de',
            path: '/'
        }, {
            name,
            value,
            domain: '.check24-test.de',
            path: '/'
        }]);
        await page.reload();
    };
}
