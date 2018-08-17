const http = require('http');
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


exports.run = function () {
	process.title = 'nodejs/worker/node';
	console.log(`start worker`);

}