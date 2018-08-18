const http = require('http');
const cluster = require('cluster');
let handler = require('./handler.js');
const host = '127.0.0.1';
const port = 3334;

let server = http.createServer(function (req, res) {
	console.log(`process pid: ${process.pid}, handle request`);
	handler(req, res);
});

let methodMap = {
	restart: function () {
		process.emit('restart');
	},
	reload: function () {
		process.emit('reload');
	},
	listen: function (message) {
		listen(message.cpu || 0);
	}
}


function listen(cpu) {
	process.title = `nodejs/worker/${cpu}`;
	server.listen({
		host: host,
		port: port,
		exclusive: false
	}, function (err) {
		if(err){
			console.log(`cpu: ${cpu}, listen http error ${host}:${port}`);
			return;
		}
		console.log(`cpu: ${cpu}, listen http ok ${host}:${port}`);
	})
}


process.on('message', function (message) {
	if(message && message.cmd && methodMap[message.cmd]){
		console.log(`receive message, cmd: ${message.cmd}`);
		methodMap[message.cmd](message);
	}
})

if (cluster.isWorker) {
    
    console.log(`process ${process.pid}: add disconnect event`);
    cluster.worker.on('disconnect', async _ => {
        console.log(`process ${process.pid}: disconnect`);
    })
    console.log(`process ${process.pid}: add exit event`);
    cluster.worker.on('exit', async _ => {
        console.log(`process ${process.pid}: exit`);

    })
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
    console.log(`process ${process.pid}: add exit event`);
    process.on('exit', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, exit`);
    });

    console.log(`process ${process.pid}: add beforeExit event`);
    process.on('beforeExit', async function () {
    	/*监听master的restart通知，关闭chrome进程*/
    	console.log(`process pid: ${process.pid}, beforeExit`);
    });
}
console.log(`process ${process.pid} cluster: add disconnect event`);
cluster.on('disconnect', function (worker) {
	console.log(`cluster:worker ${worker.process.pid} disconnect`)
	if(worker.process.pid == process.pid){
		console.log(`cluster:current process ${worker.process.pid} disconnect`);
	}
});

console.log(`process ${process.pid} cluster: add exit event`);
cluster.on('exit', function (worker) {
	console.log(`cluster:worker ${worker.process.pid} exit`)
	console.log(`current pid: ${process.pid}`)
	if(worker.process.pid == process.pid){
		console.log(`cluster:current process ${worker.process.pid} exit`);
	}
});

exports.run = function () {
	process.title = 'nodejs/worker/node';
	console.log(`start worker`);

}