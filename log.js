let Log = require('log');
let parameters = require('./parameters').parameters;
var fs = require('fs');
var path = require('path');

let stream = undefined;
if(parameters.logToFile){
     stream = fs.createWriteStream(path.resolve('./log.txt'));
}


module.exports = {
    logger: new Log(parameters.logLevel, stream)
};