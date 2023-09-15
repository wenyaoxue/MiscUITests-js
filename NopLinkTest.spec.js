const { test, expect } = require('@playwright/test');

// page.waitForTimeout(3000)

//since it's in order, the tests can't be performed in parallel - eg workers should be 1
test.describe('Nop Link Test', () => {
    let page;
    let urlstem = "https://admin-demo.nopcommerce.com";
    let urls = {}


    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        //login
        await page.goto(urlstem);
        await page.locator("//button").click();
        await expect(page).toHaveURL(urlstem+'/admin/')
        await Promise.all([
            page.waitForNavigation(),
            page.click('"Dashboard"')
        ]);

        
        const links = await page.locator('a').all();
        // console.log(links);
        for (const link of links) {
            const href = await link.getAttribute('href')
            if (href != null && href.includes("/") && !href.includes("logout")) {
				let urltoadd = (href.charAt(0) == '/' ? urlstem : "") + href;
                urls[urltoadd] = 1
            }
        }
    });


    test('Apply', async () => {
        let i = 1
        for (let url in urls) {
            if (url.includes("List") || url == 'https://admin-demo.nopcommerce.com/Admin/Tax/Categories' || url == 'https://admin-demo.nopcommerce.com/Admin/Shipping/Providers') {
                console.log(i, 'skipping', url)
                i++
                continue
            }
            await page.goto(url); //some failing here

            console.log(url)
            let title = await page.title() //some failing here

            console.log(i, url, "------", title)
            i++

            if (url == "https://admin-demo.nopcommerce.com/Admin/Shipping/Warehouses" || url == 'https://admin-demo.nopcommerce.com/Admin/Shipping/DatesAndRanges') {
                console.log('skipping h1')
                continue
            }

            const h1s = await page.locator('h1').all(); //some failing here
			if (h1s.length == 0)
				console.log("no h1 tag");
			else {
				for (const h1 of h1s) {
                    const text = await h1.innerText();
                    console.log(text+";");
                }
			}
            console.log()
        }
        // for (const link of await page.locator("a").all()) {
        // for (const link of await page.$$("a")) {
        
    });

    
    test.afterAll(async () => {
        await page.getByRole('link', { name: 'Logout' }).click();
        await expect(page).toHaveURL(urlstem+'/login?ReturnUrl=%2Fadmin%2F') 
    });

})
