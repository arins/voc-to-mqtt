let Mqtt = require('mqtt');
let paramters = require('./parameters').parameters;
let logger = require('./log').logger;

function MqttHandler() {
    const self = this;
    if(!paramters.mqtt){
        return;
    }
    
    if (paramters) {
        this.client = Mqtt.connect(paramters.mqtt.server, {
            clientId: paramters.mqtt.clientId,
            connectTimeout: paramters.mqtt.connectTimeout,
            keepalive: paramters.mqtt.keepalive,
            password: paramters.mqtt.password,
            username: paramters.mqtt.username,
            reconnectPeriod: paramters.mqtt.reconnectPeriod,
            port: paramters.mqtt.port

        });
        this.client.on('error', (topic, message) => {
            logger.error('mqtt error - ' + topic + ' : ' + message.toString());
        });
        this.client.on('close', () => {
            logger.error('mqtt close');
        });
        this.client.on('reconnect', () => {
            logger.error('mqtt reconnect');
        });
    }
    this.publish = function (data) {             
        try {
            const topic = 'voc-to-mqtt/data' ;
            logger.info('mqtt - publish on topic - ' + topic + ' ' + JSON.stringify(data));;
            this.client.publish(topic, data, { qos: 2, retain: false });
        } catch (e) {
            logger.error(e);
        }
    };



}

module.exports = {
    mqttHandler: new MqttHandler()
}