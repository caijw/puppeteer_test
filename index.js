const cluster = require('cluster');
const http = require('http');

const master = require('./master.js');
const slaver = require('./slaver.js');

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
        master.run();
    }else{
        slaver.run();
    }
}

run();