const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() === 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });
    let viewedPages = [];

    async function getHtml(url, recursive = true) {
        console.log('Load page №' + (viewedPages.length + 1) + ' ' + url);
        await page.goto(url, { waitUntil: "networkidle0" });
        let content = await page.content();
        saveHtml(url, content);
        viewedPages.push(url);
        if(!recursive) return;

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
                try{
                    await getHtml(link);
                }catch (e) {
                    console.log(e)
                }
            }
        }
    }

    let args = process.argv.slice(2);
    if(args.length > 0 && args[0].match(/^--url=/)) {
        let url = args[0].replace('--url=', '');
        await getHtml(url, false);
    }else{
        await getHtml('https://new.lsboutique.ru/');
    }

    await browser.close();
})();





function saveHtml(url, content) {
    url = url.replace('https://new.lsboutique.ru', '');
    let dir = './dist' + path.parse(url + '/index.html').dir;
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/index.html', content);
}