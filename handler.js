// const puppeteer = require('puppeteer');

// let browser = null;

// module.exports = async function(req, res) {
// 	console.log(req.url)
// 	if(!browser){
// 		browser = await puppeteer.launch({
// 			headless: false,
// 			timeout: 10000
// 		});
// 	}

//     const page = await browser.newPage();
//     await page.goto('https://www.baidu.com', {
//     	waitUntil: 'load'
//     });
//     page.setViewport({width: 375, height: 814});
//     let picBuffer = await page.screenshot({});

//     res.writeHead(200);
//     res.write(picBuffer);
//     res.end(`process ${process.pid} say: hello world`);
// }

// process.on('restart', async function () {
// 	/*监听master的restart通知，关闭chrome进程*/
// 	console.log(`process pid: ${process.pid}, receive restart event`);

// 	await browser.close();
// 	browser = null;

// })
const cluster = require('cluster');

if (cluster.isWorker) {
    
    console.log(`process ${process.pid}: add disconnect event`);
    cluster.worker.on('disconnect', async _ => {
        console.log(`process ${process.pid}: disconnect`);
    })
    console.log(`process ${process.pid}: add exit event`);
    cluster.worker.on('exit', async _ => {
        console.log(`process ${process.pid}: exit`);

    })

    console.log(`process ${process.pid}: add beforeExit event`);
    cluster.worker.on('beforeExit', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, beforeExit`);
    });
    

    console.log(`process ${process.pid}: add restart event`);
    process.on('restart', async function () {
        console.log(`process ${process.pid}: restart`);
        
    });
    console.log(`process ${process.pid}: add exit event`);
    process.on('exit', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, exit`);
    });
    
    console.log(`process ${process.pid}: add disconnect event`);
    process.on('disconnect', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, disconnect`);
    });

    console.log(`process ${process.pid}: add beforeExit event`);
    process.on('beforeExit', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, beforeExit`);
    });
}
// console.log(`process ${process.pid} cluster: add disconnect event`);
// cluster.on('disconnect', function (worker) {
// 	console.log(`cluster:worker ${worker.process.pid} disconnect`)
// 	if(worker.process.pid == process.pid){
// 		console.log(`cluster:current process ${worker.process.pid} disconnect`);
// 	}
// });

// console.log(`process ${process.pid} cluster: add exit event`);
// cluster.on('exit', function (worker) {
// 	console.log(`cluster:worker ${worker.process.pid} exit`)
// 	console.log(`current pid: ${process.pid}`)
// 	if(worker.process.pid == process.pid){
// 		console.log(`cluster:current process ${worker.process.pid} exit`);
// 	}
// });

module.exports = async function(req, res) {
    res.writeHead(200);
    res.end(`process ${process.pid} say: hello world`);
}


