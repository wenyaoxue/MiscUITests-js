const { test, expect } = require('@playwright/test');

//since it's in order, the tests can't be performed in parallel - eg workers should be 1
test.describe('Nop Link Test', () => {
    let page;
    let urlstem = "https://admin-demo.nopcommerce.com";
    let urls = {}
    test.setTimeout(120000) //otherwise the test will fail even though everything passes, because it didn't meet the default time limit
    //i tried to instead put test() inside a for loop, got no tests found error

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

        await page.locator("//p[normalize-space()='Catalog']").click();
        await page.locator("//p[normalize-space()='Products']").click();
        await page.locator("//td").nth(0).click() //make sure product table has loaded
        
        let tablepage = 1;
        const gridinfotext = await page.locator("//div[@id='products-grid_info']").innerText();
        let totItems = gridinfotext.split(" of ")[1].split(" items")[0]

        while (true) {
            let item1num = (tablepage-1)*15 + 1
            let itemnnum = Math.min(tablepage*15, parseInt(totItems))
            await page.getByText(item1num+'-'+itemnnum+' of '+totItems+' items').click();

            const links = await page.locator("//a[@class='btn btn-default']").all();
            const prodNames = await page.locator("//tr/td[3]").all()
            for (let i = 0; i < links.length; i++) {
                const link = links[i]
                const href = await link.getAttribute('href')
                if (href != null && href.includes("/") && !href.includes("logout")) {
                    let urltoadd = urlstem + "/Admin/Product/" + href
                    urls[urltoadd] = (await prodNames[i].innerText()).trim()
                }
            }
            console.log("got links from table page ", tablepage)

            const next = page.locator("//li[contains(@class, 'next')]");
            const nextclass = await next.getAttribute("class")
            if (nextclass.includes('disabled')) //unhardcoded version of if (tablepage == 3)
                break
            else {
                await next.click()
                tablepage++;
            }
        }
    });


    test('Apply', async () => {
        let i = 1
        for (let url in urls) {
            await page.goto(url)
            let title = await page.title()
            let prodname = (await (await page.locator('h1').nth(1)).innerText()).replace("Edit product details - ", "").replace("back to product list", "").trim()
            console.log(i, url, "------", title, "------", prodname)
            expect(prodname).toBe(urls[url])
            i++
        }
        
    });

    
    test.afterAll(async () => {
        await page.getByRole('link', { name: 'Logout' }).click();
        await expect(page).toHaveURL(urlstem+'/login?ReturnUrl=%2Fadmin%2F')
    });

})
