const http = require('http');
const port = 12701;
const address = '127.0.0.1';
let actionMap = {
	'reload': function (req, res) {
		process.emit('reload', req.url);
		res.writeHead(200);
		res.end('ok');
	}
}

const server = http.createServer(function (req, res) {
	console.log(`admin request by ${req.url}`);
	if(req.url.indexOf('/reload') !== -1){
		actionMap['reload'].call(actionMap, req, res);
	}

});

exports.run = function () {
	console.log(`start admin...`);
	server.listen(port, address, function (err) {
		if(err){
			console.log(`admin listen error ${address}:${port}`);
		}else{
			console.log(`admin listen ok ${address}:${port}`);
		}
	})
}