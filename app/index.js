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

var server = restify.createServer({
  version: version
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function(req, res, next) {
  db.getAllLevels()
    .then(function(levelList) {
      res.send(200, 'hello, world!\n' + JSON.stringify(levelList, null, 2));
    }, function(error) {
      res.send(200, {
        error: error
      });
    });
  return next();
});

server.get('/level', function(req, res, next) {
  res.send(200, 'hello, level!');
  next();
});

server.post('/level', function(req, res, next) {
  res.send(200, true);
  next();
});

server.listen(PORT, function() {
  console.log('flood-pi-admin %s server started at %s.', version, server.url);
  db.init(DB_NAME)
    .then(db.inflate, function(err) {
      console.error(err);
    });
  client.init(CLIENT_PORT);
});