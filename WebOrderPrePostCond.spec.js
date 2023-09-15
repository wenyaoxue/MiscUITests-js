//import { test, expect } from '@playwright/test';
const { test, expect } = require('@playwright/test');

//since it's in order, the tests can't be performed in parallel - eg workers should be 1
test.describe('E2E WebOrder Application', () => {
  let page;
  let ExpUserName;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://secure.smartbearsoftware.com/samples/TestComplete11/WebOrders/Login.aspx');
    //Browser.object.action
    await page.getByLabel('Username:').fill('Tester');
    //await page.pause();
    await page.getByLabel('Password:').fill('test');
    await page.getByRole('button', { name: 'Login' }).click();
    //Verify that user has logged in
    //await page.url().includes('/Default1.aspx')
    await expect(page).toHaveURL('http://secure.smartbearsoftware.com/samples/TestComplete11/WebOrders/default.aspx')

  });

  test('Create Order', async () => {
    await page.getByRole('link', { name: 'Order' }).nth(1).click();
    //Verify that user has clicked on Order Link
    await page.url().includes('/Process.aspx')
    await page.getByRole('combobox', { name: 'Product:*' }).selectOption('FamilyAlbum');
    //await page.getByLabel('Quantity:*').click();
    //await page.getByText('Quantity:*').click();
    await page.getByLabel('Quantity:*').fill('5');
    //await page.getByLabel('Customer name:*').click();
    ExpUserName = 'Dixit' + Math.random() * 1000;

    await page.getByLabel('Customer name:*').fill(ExpUserName);
    await page.getByLabel('Street:*').fill('BTM')
    //await page.getByLabel('Street:*').isEditable().fill('BTM');
    await page.getByLabel('City:*').fill('Bangalore');
    await page.getByLabel('Zip:*').click();
    await page.getByLabel('Zip:*').fill('560076');
    await page.getByLabel('Visa').check();
    await page.getByLabel('Card Nr:*').click();
    await page.getByLabel('Card Nr:*').fill('1234567891');
    await page.getByLabel('Expire date (mm/yy):*').fill('12/23');
    await page.getByRole('link', { name: 'Process' }).click();

    const neworder = await page.locator("//strong[normalize-space()='New order has been successfully added.']")
    await expect(neworder).toContainText('New order has been successfully added.')

    await page.getByRole('link', { name: 'View all orders' }).click();
    // Verify that user got created
    await expect(page.locator("//td[normalize-space()='" + ExpUserName + "']")).toHaveText(ExpUserName)
  });

  test('Update Order', async () => {
    // Update the Order details

    await page.locator("//td[normalize-space()='" + ExpUserName + "']//following-sibling::td/input").click();
    await page.waitForTimeout(3000)
    await page.locator('#ctl00_MainContent_fmwOrder_TextBox3').clear()
    await page.locator('#ctl00_MainContent_fmwOrder_TextBox3').fill('Delhi');
    await page.locator("#ctl00_MainContent_fmwOrder_UpdateButton").click()

    //Verify that City value change to Delhi
    await expect(page.locator("//td[normalize-space()='" + ExpUserName + "']//following-sibling::td[text()='Delhi']")).toHaveText("Delhi")
  });

  test('Delete Order', async () => {
    // Delete the Order and Verify that Order got deleted

    await page.locator("//td[normalize-space()='" + ExpUserName + "']//preceding-sibling::td/input").click();
    await page.locator("#ctl00_MainContent_btnDelete").click()
    // Verify that user got deleted

    await expect(page.locator('#ctl00_MainContent_orderGrid')).not.toContainText(ExpUserName)

  });

  test.afterAll(async () => {
    await page.getByRole('link', { name: 'Logout' }).click()
    await page.url().includes("/Login.aspx")
  });
});