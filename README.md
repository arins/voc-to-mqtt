# voc-to-mqtt
Uses https://github.com/molobrakos/volvooncall to push data to a MQTT server to be used by OpenHab for instance

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



