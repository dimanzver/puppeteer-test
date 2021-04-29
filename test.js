const puppeteer = require('puppeteer');
const fs = require('fs');

async function getHtml() {
    let url = 'https://new.lsboutique.ru/catalog/category/new_season';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    let content = await page.content();
    fs.writeFileSync('test.html', content);

    await page.goto('https://new.lsboutique.ru/products/177787-pidzhak-isaia?catalogSlug=new_season');
    let content2 = await page.content();
    fs.writeFileSync('test2.html', content2);

    await browser.close();
}

getHtml();