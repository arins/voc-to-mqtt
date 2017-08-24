let MqttHandler = require('./mqtt').mqttHandler;
let logger = require('./log').logger;
var exec = require('child_process').exec;
let paramters = require('./parameters').parameters;
var equal = require('deep-equal');

function EventPublisher(MqttHandler) {
    this.currentData = {};

    var self = this;
    self.saveCurrentData = function (data) {
        self.currentData = data;
    };
    self.hasCurrentData = function () {
        return !!self.currentData;
    };
    self.getCurrentData = function () {
        return self.currentData;
    };
    this.dataChanged = function (newData) {
        if (!self.hasCurrentData()) {
            logger.info('mqtt - data changed (is not set)');
            return true;
        }

        const currentData = self.getCurrentData();

        if (!equal(currentData, newData)) {
            logger.info('mqtt - data changed (nr of items)');
            return true;
        }
        return false;
    };

    this.getDataFromVocExec = function () {
        return new Promise(function (fulfill, reject) {
            const toExec = paramters.pathToVocApi + ' -g  -u ' + paramters.VOCUsername + ' -p ' + paramters.VOCPassword + ' print'
            exec(toExec, function callback(error, stdout, stderr) {
                if (stderr) {
                    logger.error(stderr);
                    reject(stderr);
                } else {
                    fulfill(JSON.parse(stdout));
                }
            });
        });



    }

    this.publishNewData = function () {
       
        return self.getDataFromVocExec().then((data) => {
            if (self.dataChanged(data)) {
                self.saveCurrentData(data)

                logger.info('mqtt - publishing data: ' + JSON.stringify(data));
                MqttHandler.publish(JSON.stringify(data));
            }
            return self.getCurrentData();
            
        });
    }

}

module.exports = {
    EventPublushier: new EventPublisher(MqttHandler)
};