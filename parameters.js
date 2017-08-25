var parser = require('argv-parser');
var fs = require('fs');
var path = require('path');
function parse(argv) {
    var result = parser.parse(argv, {
        rules: {
                    
            logLevel: {
                type: String,
                value: 'ERROR'
            },
           
            logToFile: {
                type: Boolean,
                value: false
            },
           
            configFile: {
                type: String,
                value: 'config.json'
            },
            convertToOpenHab: {
                type: Boolean,
                value: true
            }
            
        }
    });
    if (result.parsed.logToFile) {
        result.parsed.logToScreen = false;
    }
    result.parsed.mqtt = {topic: 'topic'};
    return result.parsed;
}

function mergeWithFileConfig(argData) {
    const exist = fs.existsSync(path.resolve(argData.configFile));
    const data = fs.readFileSync(path.resolve(argData.configFile));
    
    if (data) {
        
        argData = Object.assign(argData, JSON.parse(data.toString()));
    }
    
    return argData;
}

mergeWithFileConfig(parse(process.argv));



module.exports = {
    parameters: mergeWithFileConfig(parse(process.argv))
};