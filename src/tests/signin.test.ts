import { SeleniumHelper } from "../seleniumHelper";
import { By, until } from "selenium-webdriver";
import dotenv from "dotenv";

dotenv.config();

describe("Login Page Automation", () => {
    let seleniumHelper: SeleniumHelper;

    beforeAll(() => {
        seleniumHelper = new SeleniumHelper();
    });

    afterAll(async () => {
        await seleniumHelper.quit();
    });

    test("User should be able to log in", async () => {
        try {
            console.log("Starting login test...");
            await seleniumHelper.login();
            console.log("Login function completed, waiting for redirect...");

            // Wait for URL to change after successful login
            await seleniumHelper.getDriver().wait(
                until.urlContains('/'), // Assuming redirect is to /
                10000
            );

            // Get the current URL to verify redirect
            const currentUrl = await seleniumHelper.getDriver().getCurrentUrl();
            console.log("Current URL:", currentUrl);

            // Verify we're no longer on signin page and have been redirected
            expect(currentUrl).not.toContain('/signin');
            expect(currentUrl).toContain('/');

        } catch (error) {
            // Log the page source if the test fails
            try {
                const pageSource = await seleniumHelper.getDriver().getPageSource();
                console.log("Page source at failure:", pageSource);
            } catch (e) {
                console.log("Couldn't get page source:", e);
            }

            console.error("Test failed:", error);
            throw error;
        }
    }, 20000);
});
