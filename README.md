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



### How to use in OpenHab2 (not tested in OpenHab1 but should work)
You will need MQTT binding to be able to use this in OpenHab1/2
Below is an example for OpenHab2 items. Put this in your items files and then you can use the items as you like.

There are two transforms which will be needed they are included further down.

#### Openhab items

```
/* volvo */
Number Volvo_xc60_average_fuel_consumption "Average Fuel Consumption" {mqtt="<[mqttserver:voc-to-mqtt/data/averageFuelConsumption:state:JS(toNumber.js)]"}
Number Volvo_xc60_averageSpeed "Average Speed" {mqtt="<[mqttserver:voc-to-mqtt/data/averageSpeed:state:JS(toNumber.js)]"}

String Volvo_xc60_brakeFluid "Break fluid" {mqtt="<[mqttserver:voc-to-mqtt/data/brakeFluid:state:JS(toString.js)]"}
Number Volvo_xc60_distanceToEmpty "Distance to Empty" {mqtt="<[mqttserver:voc-to-mqtt/data/distanceToEmpty:state:JS(toNumber.js)]"}
Number Volvo_xc60_fuelAmount "Fuel Amount" {mqtt="<[mqttserver:voc-to-mqtt/data/fuelAmount:state:JS(toNumber.js)]"}
Number Volvo_xc60_fuelAmountLevel "Fuel Amount Level" {mqtt="<[mqttserver:voc-to-mqtt/data/fuelAmountLevel:state:JS(toNumber.js)]"}
Number Volvo_xc60_fuelTankVolume "Fuel Tank Volume" {mqtt="<[mqttserver:voc-to-mqtt/data/fuelTankVolume:state:JS(toNumber.js)]"}
String Volvo_xc60_fuelType "Fuel Type" {mqtt="<[mqttserver:voc-to-mqtt/data/fuelType:state:JS(toString.js)]"}
String Volvo_xc60_registrationNumber "Registration Number" {mqtt="<[mqttserver:voc-to-mqtt/data/registrationNumber:state:JS(toString.js)]"}
String Volvo_xc60_subscriptionEndDate "Subscription End Date" {mqtt="<[mqttserver:voc-to-mqtt/data/subscriptionEndDate:state:JS(toString.js)]"}
String Volvo_xc60_vehicleType "Vehicle Type" {mqtt="<[mqttserver:voc-to-mqtt/data/vehicleType:state:JS(toString.js)]"}

/*read only  */
Switch Volvo_xc60_carLocked "Car locked" {mqtt="<[mqttserver:voc-to-mqtt/data/carLocked:state:JS(toString.js)]"}
// send on or off to enable carlock (not implemented yet)
Switch Volvo_xc60_carLock "Lock car" {mqtt=">[mqttserver:voc-to-mqtt/data/carLock:command:OFF:OFF],>[mqttserver:voc-to-mqtt/data/carLock:command:ON:ON]"}
// on if the car is either unlocking or locking currently (Can be used to disable buttons) (not implemented yet)
Switch Volvo_xc60_lockChangeStatus "Lock status" {mqtt="<[mqttserver:voc-to-mqtt/data/lockChangeStatus:state:JS(toString.js)]"}

String Volvo_xc60_washerFluidLevel "Washer Fluid Level" {mqtt="<[mqttserver:voc-to-mqtt/data/washerFluidLevel:state:JS(toString.js)]"}
Switch Volvo_xc60_engineRunning "Engine running" {mqtt="<[mqttserver:voc-to-mqtt/data/engineRunning:state:JS(toString.js)]"}

//doors
Switch Volvo_xc60_doors_tailgateOpen "Tail gate open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/tailgateOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_doors_rearRightDoorOpen "Rear right door open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/rearRightDoorOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_doors_rearLeftDoorOpen "Rear left door open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/rearLeftDoorOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_doors_frontRightDoorOpen "Front right door open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/frontRightDoorOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_doors_hoodOpen "Hood open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/hoodOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_doors_frontLeftDoorOpen "Front left door open" {mqtt="<[mqttserver:voc-to-mqtt/data/doors/frontLeftDoorOpen:state:JS(toString.js)]"}

//calculatedPosition
Location Volvo_xc60_calculatedPosition_location "location" {mqtt="<[mqttserver:voc-to-mqtt/data/calculatedPosition/location:state:JS(toLocation.js)]"}
Switch Volvo_xc60_calculatedPosition_speed "speed" {mqtt="<[mqttserver:voc-to-mqtt/data/calculatedPosition/speed:state:JS(toString.js)]"}
Switch Volvo_xc60_calculatedPosition_heading "heading" {mqtt="<[mqttserver:voc-to-mqtt/data/calculatedPosition/heading:state:JS(toString.js)]"}

//position
String Volvo_xc60_position_location "location" {mqtt="<[mqttserver:voc-to-mqtt/data/position/location:state:JS(toString.js)]"}
Switch Volvo_xc60_position_speed "speed" {mqtt="<[mqttserver:voc-to-mqtt/data/position/speed:state:JS(toString.js)]"}
Switch Volvo_xc60_position_heading "heading" {mqtt="<[mqttserver:voc-to-mqtt/data/position/heading:state:JS(toString.js)]"}

//tyrePressure
String Volvo_xc60_tyrePressure_frontLeft "tyrePressure frontLeft" {mqtt="<[mqttserver:voc-to-mqtt/data/tyrePressure/frontLeftTyrePressure:state:JS(toString.js)]"}
String Volvo_xc60_tyrePressure_frontRight "tyrePressure frontRight" {mqtt="<[mqttserver:voc-to-mqtt/data/tyrePressure/frontRightTyrePressure:state:JS(toString.js)]"}
String Volvo_xc60_tyrePressure_rearLeft "tyrePressure rearLeft" {mqtt="<[mqttserver:voc-to-mqtt/data/tyrePressure/rearLeftTyrePressure:state:JS(toString.js)]"}
String Volvo_xc60_tyrePressure_rearRight "tyrePressure rearRight" {mqtt="<[mqttserver:voc-to-mqtt/data/tyrePressure/rearRightTyrePressure:state:JS(toString.js)]"}


//windows
Switch Volvo_xc60_windows_frontLeftWindowOpen "window front Left open" {mqtt="<[mqttserver:voc-to-mqtt/data/windows/frontLeftWindowOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_windows_rearLeftWindowOpen "window rear Left open" {mqtt="<[mqttserver:voc-to-mqtt/data/windows/rearLeftWindowOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_windows_rearRightWindowOpen "window rear Right open" {mqtt="<[mqttserver:voc-to-mqtt/data/windows/rearRightWindowOpen:state:JS(toString.js)]"}
Switch Volvo_xc60_windows_frontRightWindowOpen "window front Right open" {mqtt="<[mqttserver:voc-to-mqtt/data/windows/frontRightWindowOpen:state:JS(toString.js)]"}

//heater

// read only
Switch Volvo_xc60_heaterOn "Heater on/off" {mqtt="<[mqttserver:voc-to-mqtt/data/heater:state:JS(toString.js)]"}

// set the heat on or off (not implemented yet)
Switch Volvo_xc60_heater "Heater" {mqtt=">[mqttserver:voc-to-mqtt/data/heat:command:OFF:OFF],>[mqttserver:voc-to-mqtt/data/heat:command:ON:ON]"}

// if heater is current being put on or off (not implemented yet)
Switch Volvo_xc60_heaterStatus "Heater status" {mqtt="<[mqttserver:voc-to-mqtt/data/heaterStatus:state:JS(toString.js)]"}

```

####  transform
Put these in your transform folder 

toString.js
```javascript

(function (i) {

  if(i){
    return i.toString();
  }
  else{
    return '-';
  }
})(input)

```

toNumber.js transform

```javascript
(function (i) {
  var parsed = parseFloat(i);
  return parsed;
})(input)


```