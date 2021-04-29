const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let viewedPages = [];

    async function getHtml(url) {
        console.log('Load page ' + url);
        await page.goto(url);
        let content = await page.content();
        saveHtml(url, content);
        viewedPages.push(url);

        // process links
        let links = await page.evaluate(() => {
            let urls = [];
            document.querySelectorAll('a').forEach(a => {
                if(a.href[0] === '/') {
                    urls.push('https://new.lsboutique.ru' + a.href);
                }else if(a.href.includes('https://new.lsboutique.ru')) {
                    urls.push(a.href);
                }
            });
            return urls;
        });

        for (let link of links) {
            if(!viewedPages.includes(link)) {
                await getHtml(link);
            }
        }
    }

    await getHtml('https://new.lsboutique.ru/');

    await browser.close();
})();





function saveHtml(url, content) {
    url = url.replace('https://new.lsboutique.ru', '');
    let dir = './dist' + path.parse(url + '/index.html').dir;
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/index.html', content);
}