flood-pi-admin
===
> RESTful administrative console for the flood-pi project.

Visit the [flood-pi project](https://github.com/bustardcelly/flood-pi) for more information.

Introduction
---
The __flood-pi-admin__ is a NodeJS-based server that provides a RESTful API for POSTing and accessing flood level reading data posted by a [flood-pi](https://github.com/bustardcelly/flood-pi) detector. It provides routing to show charting of aggregate data based on time range, as well as an immediate response to whether or not there is a flood detected:

![flood detected](https://raw.githubusercontent.com/bustardcelly/flood-pi-admin/master/images/detection_negative.png)

Requirements
---
__flood-pi-admin__ requires [NodeJS](http://nodejs.org/).

### Installing NodeJS on Ubuntu
```
sudo apt-get update

curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
```

Installation
---
Once NodeJS is set up on your system, pull the project from github and setup:

```
$ sudo apt-get install git
$ git clone https://github.com/bustardcelly/flood-pi-admin.git flood-pi-admin
$ cd flood-pi-admin
$ npm install
```

Running
---
Running the server requires a __config.json__ file to be present at the root of the project. The [config.json.template](https://github.com/bustardcelly/flood-pi-admin/config.json.template) file is available to be modifies and saved as __config.json__ in the same directory with the necessary properties for _dev_ and _prod_ environments.

The _dev_ configuration is probably sufficient for local development and will deploy the server on localhost at port 8001. The _prod_ option should point to your production server host and port when deployed for production.

### In Development

```
$ npm run build-client
$ npm run server
```

With the default options from __config.json__, open http://localhost:8001 and you should see a chart displaying the flood-level readings from a running [flood-pi](https://github.com/bustardcelly/flood-pi) detector if set up to report to the localhost server.

### In Production
It is recommended to install [forever](https://github.com/nodejitsu/forever) globally as there are npm script to start and stop the server as a daemon. Additionally, you should modify the _"prod"_ entry of the __config.json__ file to point to your production host and port that the __flood-pi-admin__ server will be run.

```
$ npm install -g forever
$ mkdir log
$ npm run build-client-prod
$ npm run daemon-start
```

API
---
The following describes the API using cURL and assuming that the server is running on localhost at port 8001.

### NEED TO KNOW
```
$ curl -X GET http://localhost:8001/isitflooded
```
Displays positive or negative result and last read statistics.

### GETting Data

```
$ curl -X GET http://localhost:8001/
```
Displays all data repored by flood-pi detector.

```
$ curl -X GET http://localhost:8001/level
```
Shows results for last 24 hours.

```
$ curl -X GET http://localhost:8001/level?range=(day|week|year|all)
```
Shows results data on time range.

### POSTing Data

```
$ curl -X POST http://localhost:8001/level -H "Content-Type: application/json" -d '{"level":324}'
```
POSTs level reading value.

```
$ curl -X POST http://localhost:8001/configuration -H "Content-Type: application/json" -d '{"delay":15, "range": {"minimum": 300, "maximum": 500}}'
```
POSTs configuration object used in displaying data.