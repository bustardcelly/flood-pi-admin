'use strict';
var path = require('path');
var restify = require('restify');
var argsv = require('minimist')(process.argv.slice(2));
var version = require(path.join(process.cwd(), 'package.json')).version;

// Server configuration.
var PORT = argsv.port || 8001;
var CLIENT_PORT = argsv.clientport || 8002;
var DB_NAME = argsv.db || 'floodpi';

var db = require('./db');
var client = require('./client');
var levelRouteController = require('./route/level-route-controller');

var server = restify.createServer({
  version: version,
  formatters: {
    'application/json': function(req, res, body) {
      if(req.params.callback) {
        var callbackFunctionName = req.params.callback.replace(/[^A-Za-z0-9_\.]/g, '');
        return callbackFunctionName + "(" + JSON.stringify(body) + ");";
      }
      else {
        return JSON.stringify(body);
      }
    },
    'text/html': function(req, res, body) {
      return body;
    }
  }
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', levelRouteController.showAll);
server.get('/level', levelRouteController.showAll);
server.post('/level', levelRouteController.add);

server.listen(PORT, function() {
  console.log('flood-pi-admin %s server started at %s.', version, server.url);
  db.init(DB_NAME)
    .then(db.inflate, function(err) {
      console.error(err);
    });
  client.init(CLIENT_PORT);
});