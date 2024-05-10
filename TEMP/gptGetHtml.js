const puppeteer = require('puppeteer');
const fs = require('fs');

// 封装成可调用模块的函数  
async function scrapeWebsite(url) {
    return new Promise(async (resolve, reject) => {
        let browser, page;

        try {
            browser = await puppeteer.launch({ headless: true });
            page = await browser.newPage();

            // 模拟加载主页  
            console.log('Loading homepage...');
            await page.goto(url, { waitUntil: 'networkidle0' });

            // 提取主页文本内容
            const homepageText = await extractText(page);

            // 输出主页文本内容
            console.log('Homepage text:', homepageText);

            // 获取所有链接
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]')).map(link => link.href);
            });

            // 模拟加载全部子页面并提取文本内容
            const allPagesText = await scrapeAllPages(browser, links);

            // 写入JSON文件  
            fs.writeFileSync('output.json', JSON.stringify(allPagesText, null, 2));

            console.log('Scraping completed!');
            resolve(allPagesText);
        } catch (error) {
            console.error('An error occurred:', error);
            reject(error);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    });
}

// 提取页面文本内容函数
async function extractText(page) {
    const textContent = await page.evaluate(() => {
        return document.body.innerText.trim();
    });
    // 过滤图片、空格、换行等字符数据
    // const filteredText = textContent.replace(/[\u200B-\u200D\uFEFF]+|[\s\n\r]+|(https?:\/\/\S+)/g, '');
    // return filteredText;
    // 过滤图片、空格、换行等字符数据，并将空格和换行符替换为逗号
    const filteredText = textContent.replace(/[\u200B-\u200D\uFEFF]+|[\s\n\r]+/g, ',');
    return filteredText;
}

// 递归获取所有子页面文本内容
async function scrapeAllPages(browser, links) {
    const allPagesText = {};
    for (const link of links) {
        try {
            const page = await browser.newPage();
            console.log(`Loading page: ${link}`);
            await page.goto(link, { waitUntil: 'networkidle0' });
            const pageText = await extractText(page);
            allPagesText[link] = pageText;
            console.log(`Page text for ${link}:`, pageText);
            await page.close();
        } catch (error) {
            console.error(`Error scraping page ${link}:`, error);
        }
    }
    return allPagesText;
}

// 导出scrapeWebsite函数  
module.exports = scrapeWebsite;