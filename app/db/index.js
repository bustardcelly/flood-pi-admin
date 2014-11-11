'use strict';
var _ = require('lodash');
var levelup = require('levelup');
var defer = require('node-promise').defer;

var levelFactory = require('../model/level-reading');
var configFactory = require('../model/configuration');

var db;
var LEVELS_KEY = 'levels';
var CONFIG_KEY = 'configuration';

var levels = [];

module.exports = {
  init: function(dbName) {
    var dfd = defer();
    var generateDBError = function(msg) {
      return 'Error in establishing DB with name ' + dbName + ': ' + msg;
    };

    db = levelup(dbName, {
      valueEncoding: 'json'
    }, function(err) {
     if(err) {
      dfd.reject(generateDBError(JSON.stringify(err, null, 2)));
     }
     else {
      dfd.resolve(true);
     }
    });

    return dfd.promise;
  },
  inflate: function() {
    var dfd = defer();
    db.get(LEVELS_KEY, function(err, data) {
      if(err && err.notFound) {
        db.put(LEVELS_KEY, [], function(err) {
          if(err) {
            console.error('Error in establising levels entry in DB: ' + JSON.stringify(err, null, 2));
          }
          dfd.resolve(true);
        });
        console.log('Levels entry not found in DB: ' + JSON.stringify(err, null, 2));
      }
      else {
        levels = data;
        dfd.resolve(true);
      }
    });
    return dfd.promise;
  },
  getAllLevels: function() {
    var dfd = defer();
    db.get(LEVELS_KEY, function(err, value) {
      if(err) {
        console.error('Error in access of levels: ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        levels = _.map(value, function(item) {
          item.formattedTime = new Date(item.time);
          return item;
        });
        dfd.resolve(value);
      }
    });
    return dfd.promise;
  },
  addLevelReading: function(level) {
    var dfd = defer();
    var newLevel = levelFactory.inflate(level);
    levels.push(newLevel);

    db.put(LEVELS_KEY, levels, function(err, data) {
      if(err) {
        console.error('Error in adding level to store: ' + JSON.stringify(newLevel, null, 2) + ', ' + JSON.stringify(err, null, 2));
        levels.pop();
        dfd.reject(err);
      }
      else {
        dfd.resolve(data);
      }
    });
    return dfd.promise;
  },
  getConfiguration: function() {
    var dfd = defer();
    db.get(CONFIG_KEY, function(err, data) {
      if(err) {
        console.error('Error in accessing configuration: ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        dfd.resolve(configFactory.inflate(data.delay, {minimum:data.minimumRange, maximum:data.maximumRange}));
      }
    });
    return dfd.promise;
  },
  saveConfiguration: function(configuration) {
    var dfd = defer();
    db.put(CONFIG_KEY, configuration, function(err, data) {
      if(err) {
        console.error('Error in saving configuration: ' + JSON.stringify(configuration, null, 2) + ', ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        dfd.resolve(data);
      }
    });
    return dfd.promise;
  }
};
