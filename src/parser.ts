import * as puppeteer from "puppeteer";

interface Result {
    httpStatus: number;
    html: string;
}

// visit given URL and return the innerHTML of the given selector
export async function getInnerHTML(url: string, selector: string): Promise<Result> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const res = await page.goto(url);

    // get the HTTP status code
    const status = res.status();
    if (status !== 200) {
        return { httpStatus: status, html: "" };
    }

    let html = "";
    try {
        if (selector) {
            html = await page.$eval(selector, (el) => el.innerHTML);
        } else {
            html = await page.$eval("body", (el) => el.innerHTML);
        }
    } catch (e) {
        // pass, the selector might not exist on the page
    }
    await browser.close();

    return { httpStatus: status, html };
}
