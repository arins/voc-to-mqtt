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



    }

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

                if(data.tyrePressure){
                    MqttHandler.publish('tyrePressure/frontLeftTyrePressure', data.tyrePressure.frontLeftTyrePressure);
                    MqttHandler.publish('tyrePressure/frontRightTyrePressure', data.tyrePressure.frontRightTyrePressure);
                    MqttHandler.publish('tyrePressure/rearLeftTyrePressure', data.tyrePressure.rearLeftTyrePressure);
                    MqttHandler.publish('tyrePressure/rearRightTyrePressure', data.tyrePressure.rearRightTyrePressure);
                }

                if(data.windows){
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