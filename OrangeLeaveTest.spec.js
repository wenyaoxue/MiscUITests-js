//import { test, expect } from '@playwright/test';
const { test, expect } = require('@playwright/test');

//since it's in order, the tests can't be performed in parallel - eg workers should be 1
test.describe('Orange Leave Flow', () => {
    let page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        //login
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        await page.getByPlaceholder('Username').fill('Admin');
        await page.getByPlaceholder('Password').fill('admin123');
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index')

        //click leave
        await page.getByRole('link', { name: 'Leave' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList')
    });


    test('Apply', async () => {
        await page.getByRole('link', { name: 'Apply' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/leave/applyLeave')
        
        await expect(await page.locator("//div/h6")).toHaveText('Apply Leave')
        // await expect(await page.locator("//p[@class='oxd-text oxd-text--p oxd-text--subtitle-2']")).toHaveText('No Leave Types with Leave Balance')
    });

    test('My Leave', async () => {
        await page.getByRole('link', { name: 'My Leave' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewMyLeaveList')

    });
    test('Leave List', async () => {
        await page.getByRole('link', { name: 'Leave List' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList')
    });
    test('Assign Leave', async () => {
        await page.getByRole('link', { name: 'Assign Leave' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/leave/assignLeave')

        await page.getByPlaceholder('Type for hints...').click();
        await page.getByPlaceholder('Type for hints...').fill('a');
        await page.getByRole('option', { name: 'Odis Adalwin' }).click();
        await page.locator('form i').first().click();
        await page.getByRole('option', { name: 'CAN - Vacation' }).click();
        await page.locator('form i').nth(2).click();
        await page.getByText('1', { exact: true }).click();
        await page.getByRole('button', { name: 'Assign' }).click();
        // await page.getByRole('button', { name: 'Ok' }).click();
        // await page.getByText('SuccessSuccessfully Saved×').click();

        //verify assigned leave in leave list
        await page.getByRole('link', { name: 'Leave List' }).click();
        await page.locator('.oxd-select-text--after > .oxd-icon').first().click();
        await page.getByRole('option', { name: 'Taken' }).click();
        await page.locator("//span[normalize-space()='Taken']").click(); //wait before clicking search
        await page.getByRole('button', { name: 'Search' }).click(); //not clicking???
        //check values
        await page.getByText('Odis Adalwin').click();
        // await expect(await page.locator("//div[@class='oxd-table-body']/div/div/div[2]/div")).toHaveText('2023-09-01')
        // await expect(await page.locator("//div[@class='oxd-table-body']/div/div/div[3]/div")).toHaveText('Odis  Adalwin')
        // await expect(await page.locator("//div[@class='oxd-table-body']/div/div/div[4]/div")).toHaveText('CAN - Vacation')

        //delete
        await page.locator("//div[@class='oxd-table-body']/div/div/div[9]/div/li").click();
        await page.getByText('Cancel Leave').click();
    });



    test.afterAll(async () => {
        await page.locator("//span[@class='oxd-userdropdown-tab']").click();
        await page.getByRole('menuitem', { name: 'Logout' }).click();
        await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
    });
});