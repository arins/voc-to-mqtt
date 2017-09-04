# voc-to-mqtt
Uses https://github.com/molobrakos/volvooncall to push data to a MQTT server to be used by OpenHab for instance
Boolean values are pushed as ON or OFF (can be configured so that it pushes true or false)

## What this is

This node application uses https://github.com/molobrakos/volvooncall (CLI) to get information about your volvo and push it to a mqtt server.
This allows for instance an OpenHab server to use the data to show information about your Volvo.

## How to install

this is only tested under ubuntu server 

1. clone this repo to any location you prefer

```bash
git clone https://github.com/arins/voc-to-mqtt.git
```

2. install npm dependencies

```bash
npm install
```

3. install volvooncall

```bash
pip3 install --user volvooncall
```

or

```bash
pip3 install volvooncall (installs https://github.com/molobrakos/volvooncall)
```

4. edit the config file config.json

Mqtt settings are straightforward

**pathToVocApi** should be something like this /home/YOURUSER/.local/bin/voc

**VOCUsername** should be your email adress which you use to login to Volvo on call

**VOCPassword** should be your password which you use to login to Volvo on call

**refreshIntervallSeconds** is how often the service will fetch data and check if data is new changed

5. (optional) Add voc-to-mqtt.service to your services and use systemd to start and stop the service
You will need to change the user in the voc-to-mqtt.service to your user you are going to run the service in.


## Usage

When the service is installed and running in the background you should recieve data in the following topics

### Topics
The data will be published under specific topics see below.


#### windows 

(ON, OFF values) 

voc-to-mqtt/datawindows/frontLeftWindowOpen 

voc-to-mqtt/datawindows/rearLeftWindowOpen

voc-to-mqtt/datawindows/rearRightWindowOpen

voc-to-mqtt/datawindows/frontRightWindowOpen


#### doors

(ON, OFF values) 

voc-to-mqtt/data/doors/tailgateOpen

voc-to-mqtt/data/doors/rearRightDoorOpen

voc-to-mqtt/data/doors/rearLeftDoorOpen

voc-to-mqtt/data/doors/frontRightDoorOpen

voc-to-mqtt/data/doors/hoodOpen

voc-to-mqtt/data/doors/frontLeftDoorOpen

#### tyre pressure

voc-to-mqtt/data/tyrePressure/frontLeftTyrePressure

voc-to-mqtt/data/tyrePressure/frontRightTyrePressure

voc-to-mqtt/data/tyrePressure/rearLeftTyrePressure

voc-to-mqtt/data/tyrePressure/rearRightTyrePressure


#### lock

voc-to-mqtt/data/carLocked

#### heater

voc-to-mqtt/data/heater


#### vehicle information

voc-to-mqtt/data/averageFuelConsumption

voc-to-mqtt/data/averageSpeed

voc-to-mqtt/data/brakeFluid

voc-to-mqtt/data/distanceToEmpty

voc-to-mqtt/data/registrationNumber

voc-to-mqtt/data/subscriptionEndDate

voc-to-mqtt/data/vehicleType

voc-to-mqtt/data/washerFluidLevel

voc-to-mqtt/data/carLocked

voc-to-mqtt/data/engineRunning



#### fuel

voc-to-mqtt/data/fuelAmount

voc-to-mqtt/data/fuelAmountLevel

voc-to-mqtt/data/fuelTankVolume

voc-to-mqtt/data/fuelType


#### Calculated Position

voc-to-mqtt/data/calculatedPosition/location
```javascript
{longitude: XX, latitude: XX}
```

voc-to-mqtt/data/calculatedPosition/speed

voc-to-mqtt/data/calculatedPosition/heading

#### Position

voc-to-mqtt/data/position/location
```javascript
{longitude: XX, latitude: XX}
```
voc-to-mqtt/data/position/speed
voc-to-mqtt/data/position/heading