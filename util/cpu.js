const os = require('os');
const cp = require('child_process');


exports.cpus = function () {
	let res = [];
	os.cpus().forEach(function (v) {
		if(v.times && v.times.idle !== 0){
			res.push(v);
		}
	});
	return res;
}

exports.parseTaskset = function (str) {
	let res = [];
	let arr = str.split(',');
	arr.forEach(function (v) {
		v = v.trim();
		let tmp = v.split('-');
		let start = ~~tmp[0];
		let end = ~~tmp[1];
		if(end < start){
			end = start;
		}
		for(let i = start, i <= end; ++i){
			res.push(i);
		}
	});
	return res;
}

exports.taskset = function (oriCpu, pid) {
	console.log(`taskset -cp ${pid}`);
	cp.exec(`taskset -cp ${pid}`, m{
		timeout: 5000
	}, function (err, data, errData) {
		const str = data;
		const tmp = str.split(':');
		let cpus;
		if(tmp.length >= 2){
			cpus = exports.parseTaskset(tmp[1]);
		}
		let cpu = oriCpu;
		if(cpus && cpus.length > 1){
			cpu = parseInt(cpus[cpu % cpus.length], 10);
		}else{
			cpu = cpu % exports.cpus().length;
		}

		if(err){
			console.error(err.stack);
		}
		if(data){
			console.log(data);
		}
		if(errData){
			console.error(errData);
		}
		console.log(`taskset -cp ${cpu} ${pid}`);

		cp.exec(`taskset -cp ${cpu} ${pid}`, {
			timeout: 5000
		}, function (err, data, errData) {
			if(err){
				console.error(err.stack);
			}
			if(data){
				console.log(data);
			}
			if(errData){
				console.log(errData);
			}
		})

	});
}