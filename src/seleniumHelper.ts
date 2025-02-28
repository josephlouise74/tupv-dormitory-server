import { Builder, By, until, WebDriver } from "selenium-webdriver";
import "dotenv/config";

export class SeleniumHelper {
    private driver: WebDriver;

    constructor() {
        this.driver = new Builder().forBrowser("chrome").build();
    }

    public getDriver() {
        return this.driver;
    }

    async login() {
        try {
            // Set the test URL, email, and password
            const websiteUrl = "http://localhost:3000/signin";
            const email = "admin@gmail.com";
            const password = "joseph74";

            await this.driver.get(websiteUrl);

            // Wait for the email field and input value
            const emailField = await this.driver.wait(until.elementLocated(By.name("email")), 5000);
            await emailField.sendKeys(email);

            // Wait for the password field and input value
            const passwordField = await this.driver.wait(until.elementLocated(By.name("password")), 5000);
            await passwordField.sendKeys(password);

            // Click the login button
            const loginButton = await this.driver.wait(until.elementLocated(By.css("button[type='submit']")), 5000);
            await loginButton.click();

            console.log("Login successful");
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    async quit() {
        await this.driver.quit();
    }
}
