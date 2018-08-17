const puppeteer = require('puppeteer');

let browser = null;

module.exports = async function(req, res) {
	console.log(req.url)
	if(!browser){
		browser = await puppeteer.launch({
			headless: false,
			timeout: 10000
		});
	}

    const page = await browser.newPage();
    await page.goto('https://www.baidu.com', {
    	waitUntil: 'load'
    });
    page.setViewport({width: 375, height: 814});
    let picBuffer = await page.screenshot({});

    res.writeHead(200);
    res.write(picBuffer);
    res.end(`process ${process.pid} say: hello world`);
}

process.on('restart', async function () {
	/*监听master的restart通知，关闭chrome进程*/
	console.log(`process pid: ${process.pid}, receive restart event`);

	await browser.close();
	browser = null;

})