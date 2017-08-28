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
            logger.info('mqtt - data changed');
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
    };

    this.resetLockingStatus = function() {
        MqttHandler.client.publish('voc-to-mqtt/data/lockChangeStatus', 'OFF');
    };
    this.timeoutForWait = 3 * 60 * 1000;
    this.waitedForLock = 0;
    this.waitForLockToComplete = function(lock){
        self.getDataFromVocExec().then((data) => {
            self.saveCurrentData(data);
            logger.info('waiting for ' + (lock ? 'lock' : 'unlock') + ' to complete currently: ' + data.carLocked)
            if(data.carLocked === lock){
                self.waitedForLock = 0;
                self.lockingOrUnlocking = false;
                logger.info((lock ? 'lock' : 'unlock') + ' done!');
                MqttHandler.client.publish('voc-to-mqtt/data/lockChangeStatus', 'OFF');    
                this.publishNewData();
            }
            else if(self.timeoutForWait < self.waitedForLock){
                logger.info((lock ? 'lock' : 'unlock') + ' timed out');
                self.lockingOrUnlocking = false;
                MqttHandler.client.publish('voc-to-mqtt/data/lockChangeStatus', 'OFF');    
                this.publishNewData();
            }
            else{
                self.waitedForLock = self.waitedForLock + 10000;
                logger.info((lock ? 'lock' : 'unlock') + ' checking again! waited ' + self.waitedForLock);
                setTimeout(function(){ self.waitForLockToComplete(lock); }, 10000);
            }
        });
    };
    this.lockingOrUnlocking = false;
    this.setUpLockingEvent = function () {
        MqttHandler.subscribeToLockEvent();
        MqttHandler.client.on('message', function (t, message) {
            if(t !== 'voc-to-mqtt/data/carLock'){
                return;
            }
            if (self.lockingOrUnlocking) {
                return;
            }
            
            if (message.toString() === 'ON' || message === true || message.toString() === 'true') {
                self.lockingOrUnlocking = true;  
                MqttHandler.client.publish('voc-to-mqtt/data/lockChangeStatus', 'ON');
                logger.info('lock!')
                self.lock().then(() => {
                    logger.info('lock ok!');
                    return self.publishNewData();
                }, () => {
                    logger.error('lock fail!');
                    return self.publishNewData();
                }).then(()=>{
                    
                    return self.waitForLockToComplete(true);
                }, ()=>{
                    
                    return self.waitForLockToComplete(true);
                    
                });
            }
            if (message.toString() === 'OFF' || message === false || message.toString() === 'false') {
                self.lockingOrUnlocking = true;    
                MqttHandler.client.publish('voc-to-mqtt/data/lockChangeStatus', 'ON');
                logger.info('unlock!')
                self.unlock().then(() => {
                    logger.info('unlock ok!');
                    return self.publishNewData();
                }, () => {
                    logger.error('unlock fail!');
                    return self.publishNewData();
                    
                    
                }).then(()=>{
                    return self.waitForLockToComplete(false);
                }, ()=>{
                    return self.waitForLockToComplete(false);
                });
            }
        });
    };

    this.lock = function () {
        return new Promise(function (fulfill, reject) {
            const toExec = paramters.pathToVocApi + ' -g  -u ' + paramters.VOCUsername + ' -p ' + paramters.VOCPassword + ' lock'
            exec(toExec, function callback(error, stdout, stderr) {
                if (stderr) {
                    logger.error(stderr);
                    reject(stderr);
                } else {
                    fulfill();
                }
            });
        });
    };

    this.unlock = function () {
        return new Promise(function (fulfill, reject) {
            const toExec = paramters.pathToVocApi + ' -g  -u ' + paramters.VOCUsername + ' -p ' + paramters.VOCPassword + ' unlock'
            exec(toExec, function callback(error, stdout, stderr) {
                if (stderr) {
                    logger.error(stderr);
                    reject(stderr);
                } else {
                    fulfill();
                }
            });
        });
    };

    this.puttingHeatOnOrOff = false;
    this.setUpHeaterEvent = function () {
        MqttHandler.subscribeToHeatEvent();
        MqttHandler.client.on('message', function (t, message) {
            if(t !== 'voc-to-mqtt/data/heat'){
                return;
            }
            if (self.puttingHeatOnOrOff) {
                return;
            }
            
            if (message.toString() === 'ON' || message === true || message.toString() === 'true') {
                self.puttingHeatOnOrOff = true;
                logger.info('heat on!')
                self.heaterOn().then(() => {
                    self.puttingHeatOnOrOff = false;
                    return self.publishNewData();
                    
                    
                }, () => {
                    logger.error('heater on fail!');
                    return self.publishNewData();
                }).then(()=>{
                    return self.waitForHeaterToComplete(true);
                }, ()=>{
                    return self.waitForHeaterToComplete(true);
                });
            }
            if (message.toString() === 'OFF' || message === false || message.toString() === 'false') {
                self.puttingHeatOnOrOff = true;    
                logger.info('heater off!')
                self.heaterOff().then(() => {
                    return self.publishNewData();
                }, () => {
                    logger.error('heater off fail!');
                    return self.publishNewData();
                }).then(()=>{
                    return self.waitForHeaterToComplete(true);
                }, ()=>{
                    return self.waitForHeaterToComplete(true);
                });
            }
        });
    };
    this.waitedForheaterToChangeTime = 0;
    this.heaterTimeoutForWait = 3 * 60 * 1000;
    this.waitForHeaterToComplete = function(heaterOn){
        self.getDataFromVocExec().then((data) => {
            self.saveCurrentData(data);
            logger.info('waiting for heater ' + (heaterOn ? 'to start' : 'to shutdown') + ' to complete currently: ' + data.heater.status === 'on')
            if(data.heater.status === (heaterOn ? 'on' : 'off')){
                self.waitedForheaterToChangeTime = 0;
                self.puttingHeatOnOrOff = false;
                logger.info((heaterOn ? 'start' : 'to shutdown') + ' done!');
                MqttHandler.client.publish('voc-to-mqtt/data/heaterStatus', 'OFF');    
                this.publishNewData();
            }
            else if(self.heaterTimeoutForWait < self.waitedForheaterToChangeTime){
                logger.info('heater ' + (heaterOn ? 'to start' : 'to shutdown') + ' timed out');
                self.puttingHeatOnOrOff = false;
                MqttHandler.client.publish('voc-to-mqtt/data/heaterStatus', 'OFF');    
                this.publishNewData();
            }
            else{
                self.waitedForheaterToChangeTime = self.waitedForheaterToChangeTime + 10000;
                logger.info('heater ' + (heaterOn ? 'to start' : 'to shutdown') + ' checking again! waited ' + self.waitedForheaterToChangeTime);

                setTimeout(function(){ self.waitForHeaterToComplete(heaterOn); }, 10000);
            }
        });
    };


     this.heaterOn = function () {
        return new Promise(function (fulfill, reject) {
            const toExec = paramters.pathToVocApi + ' -g  -u ' + paramters.VOCUsername + ' -p ' + paramters.VOCPassword + ' heater start'
            exec(toExec, function callback(error, stdout, stderr) {
                if (stderr) {
                    logger.error(stderr);
                    reject(stderr);
                } else {
                    fulfill();
                }
            });
            
        });
    };

    this.heaterOff = function () {
        return new Promise(function (fulfill, reject) {
            const toExec = paramters.pathToVocApi + ' -g  -u ' + paramters.VOCUsername + ' -p ' + paramters.VOCPassword + ' heater stop'
            exec(toExec, function callback(error, stdout, stderr) {
                if (stderr) {
                    logger.error(stderr);
                    reject(stderr);
                } else {
                    fulfill();
                }
            });
            fulfill();
        });
    };

    this.setUpRefreshEvent = function() {
        MqttHandler.subscribeToRefreshEvent();
        MqttHandler.client.on('message', function (t, message) {
            if(t === 'voc-to-mqtt/data/refresh'){
                logger.info('refresh!');
                self.publishNewData();
            }
        });
    };

    this.publishNewData = function () {

        return self.getDataFromVocExec().then((data) => {
            if (self.dataChanged(data)) {
                self.saveCurrentData(data);
                MqttHandler.publish('averageFuelConsumption', data.averageFuelConsumption);
                MqttHandler.publish('averageSpeed', data.averageSpeed);
                MqttHandler.publish('brakeFluid', data.brakeFluid);
                MqttHandler.publish('distanceToEmpty', data.distanceToEmpty);
                MqttHandler.publish('fuelAmount', data.fuelAmount);
                MqttHandler.publish('fuelAmountLevel', data.fuelAmountLevel);
                MqttHandler.publish('fuelTankVolume', data.fuelTankVolume);
                MqttHandler.publish('fuelType', data.fuelType);
                MqttHandler.publish('registrationNumber', data.registrationNumber);
                MqttHandler.publish('subscriptionEndDate', data.subscriptionEndDate);
                MqttHandler.publish('vehicleType', data.vehicleType);
                MqttHandler.publish('washerFluidLevel', data.washerFluidLevel);
                MqttHandler.publish('carLocked', data.carLocked);
                MqttHandler.publish('engineRunning', data.engineRunning);


                if (data.calculatedPosition && data.calculatedPosition.longitude) {
                    MqttHandler.publish('calculatedPosition/location',
                        {
                            longitude: data.calculatedPosition.longitude,
                            latitude: data.calculatedPosition.latitude
                        });
                }
                MqttHandler.publish('calculatedPosition/speed', data.calculatedPosition.speed);
                MqttHandler.publish('calculatedPosition/heading', data.calculatedPosition.heading);

                if (data.doors) {
                    MqttHandler.publish('doors/tailgateOpen', data.doors.tailgateOpen);
                    MqttHandler.publish('doors/rearRightDoorOpen', data.doors.rearRightDoorOpen);
                    MqttHandler.publish('doors/rearLeftDoorOpen', data.doors.rearLeftDoorOpen);
                    MqttHandler.publish('doors/frontRightDoorOpen', data.doors.frontRightDoorOpen);
                    MqttHandler.publish('doors/hoodOpen', data.doors.hoodOpen);
                    MqttHandler.publish('doors/frontLeftDoorOpen', data.doors.frontLeftDoorOpen);
                }
                if (data.position) {
                    if (data.position.longitude) {
                        MqttHandler.publish('position',
                            {
                                longitude: data.position.longitude,
                                latitude: data.position.latitude
                            });
                    }
                    MqttHandler.publish('position/speed', data.position.speed);
                    MqttHandler.publish('position/heading', data.position.heading);
                }

                if (data.tyrePressure) {
                    MqttHandler.publish('tyrePressure/frontLeftTyrePressure', data.tyrePressure.frontLeftTyrePressure);
                    MqttHandler.publish('tyrePressure/frontRightTyrePressure', data.tyrePressure.frontRightTyrePressure);
                    MqttHandler.publish('tyrePressure/rearLeftTyrePressure', data.tyrePressure.rearLeftTyrePressure);
                    MqttHandler.publish('tyrePressure/rearRightTyrePressure', data.tyrePressure.rearRightTyrePressure);
                }

                if (data.windows) {
                    MqttHandler.publish('windows/frontLeftWindowOpen', data.windows.frontLeftWindowOpen);
                    MqttHandler.publish('windows/rearLeftWindowOpen', data.windows.rearLeftWindowOpen);
                    MqttHandler.publish('windows/rearRightWindowOpen', data.windows.rearRightWindowOpen);
                    MqttHandler.publish('windows/frontRightWindowOpen', data.windows.frontRightWindowOpen);
                }


                // more stuff here




            }
            return self.getCurrentData();

        });
    };
}

module.exports = {
    EventPublushier: new EventPublisher(MqttHandler)
};
