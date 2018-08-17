const os = require('os');
const cluster = require('cluster');
const cpuUtil = require('./util/cpu.js');
const admin = require('./admin.js');

let cpuMap = [];
let workerMap = {};

function getBindCpu(worker) {
	if(typeof worker.cpuid !== 'undefined'){
		return worker.cpuid;
	}
	for(let i = 0; i < cpuMap.length; ++i){
		if(cpuMap[i] === 0){
			worker.cpuid = i;
			cpuMap[i] = 1;
			return i;
		}
	}
}


function masterEventHandler() {
	cluster.on('fork', function (curWorker) {
		let cpu = getBindCpu(curWorker);
		console.log(`worker fork success! pid:${curWorker.process.pid}, cpu: ${cpu}`);
		cpuUtil.taskset(cpu, curWorker.process.pid);
		if(workerMap[cpu]){
			closeWorker(workerMap[cpu]);
		}
		workerMap[cpu] = curWorker;
		cpuMap[cpu] = 1;
		curWorker.on('message', function (...args) {
			let m = args[0];
			if(m && methodMap[m.cmd]){
				methodMap[m.cmd].apply(this, args);
			}
		});
		curWorker.send({
			from: 'master',
			cmd: 'listen',
			cpu: cpu
		});
	});
	/*子进程退出*/
	cluster.on('disconnect', function (worker) {
		let cpu = getBindCpu(worker);
		if(worker.hasRestart){
			return;
		}
		console.log(`worker${cpu} pid=${worker.process.pid} disconnect event fire. restart new worker again.`);
		restartWorker(worker);

	});
	/*子进程被杀死*/
	cluster.on('exit', function (worker) {
		let cpu = getBindCpu(worker);
		if(worker.hasRestart){
			return;
		}
		console.log(`worker${cpu} pid=${worker.process.pid} exit event fire. restart new worker again.`);
		restartWorker(worker);

	});
	process.on('reload', function (GET) {
		console.log('reload');
		for(let key in workerMap){
			let worker = workerMap[key];
			let cpu = getBindCpu(worker);
			let timeout = 1000;
			setTimeout((function (worker, cpu) {
				return function () {
					if(!worker.exitedAfterDisconnect){
						console.log(`cpu${cpu} send restart message`);
						worker.send({
							from: 'master',
							cmd: 'restart'
						});
					}
					restartWorker(worker);

				}
			})(worker, cpu), timeout);
		}
	})
}

function closeWorker(worker) {
	let cpu = worker.cpuid;
	let closeTimeWait = 10000;
	if(worker.isClosing){
		return;
	}
	worker.isClosing = true;
	if(workerMap[cpu] === worker){
		delete workerMap[cpu];
	}
	let closeFn = (function (worker) {
		let closed = false;
		let pid = worker.process.pid;
		return function () {
			if(closed){
				return;
			}
			try{
				process.kill(pid, 9);
			}catch(e){
				console.log(`kill worker ${process.pid} message: ${e.message}`);
			}
			closed = true;
			worker.destroy();
		}
	})(worker);
	setTimeout(closeFn, closeTimeWait);
	try{
		worker.disconnect(closeFn);
	}catch(e){
		console.error(e.stack);
	}

}

function restartWorker(worker) {
	if(worker.hasRestart){
		return;
	}
	worker.hasRestart = true;
	let cpu = getBindCpu(worker);
	cpuMap[cpu] = 0;
	console.log(`worker${cpu} pid=${worker.process.pid} closed. restart new worker.`);
	cluster.fork(process.env).cpuid = cpu;
	closeWorker(worker);
}



exports.run = function () {
	console.log(`start master...`);
	console.log(`process pid: ${process.pid}`);
	let numCpus = os.cpus().length;
	for(let i = 0; i < numCpus; ++i){
		cpuMap.push(0);
		cluster.fork(process.env).cpuid = i;
	}

	masterEventHandler();
	admin.run();

}