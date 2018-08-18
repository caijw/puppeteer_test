const cluster = require('cluster');
const http = require('http');




process.on('uncaugthException', function (e) {
    console.error('uncaugthException');
    console.error(e);
  
});

process.on('warning', function (warning) {
    console.warning('warning');
    console.warning(warning);
});
// process.on('unhandledRejection', function (error, curPromise) {
    
// });

function run() {
    if(cluster.isMaster){
    	const master = require('./master.js');
        master.run();
    }else{
    	const slaver = require('./slaver.js');
        slaver.run();
    }
}

run();