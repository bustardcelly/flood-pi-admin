'use strict';
var _ = require('lodash');
var defer = require('node-promise').defer;

var RangeEnum = require('../enum/level-time-range');
var levelFactory = require('../model/level-reading');
var configFactory = require('../model/configuration');
var timeUtil = require('../util/time');

var LEVELS_KEY = 'levels';
var CONFIG_KEY = 'configuration';

var getLevelRangeMap = function(rangeEnum) {
  return function(levels) {
    switch(rangeEnum) {
      case RangeEnum.DAY:
          return levels.filter(function(item) {
            return timeUtil.withinDay(item.time);
          });
        break;
      default:
        return levels;
    }
    return undefined;
  };
};

module.exports = {
  db: undefined,
  init: function(db) {
    var dfd = defer();
    this.db = db;
    dfd.resolve(true);
    return dfd.promise;
  },
  inflate: function() {
    var db = this.db;
    var dfd = defer();
    db.get(LEVELS_KEY, function(err) {
      if(err && err.notFound) {
        db.put(LEVELS_KEY, [], function(err) {
          if(err) {
            console.error('Error in establising levels entry in DB: ' + JSON.stringify(err, null, 2));
          }
          dfd.resolve(true);
        });
        console.log('Levels entry not found in DB: ' + JSON.stringify(err, null, 2));
      }
    });
    return dfd.promise;
  },
  getAllLevels: function() {
    var db = this.db;
    var dfd = defer();
    db.get(LEVELS_KEY, function(err, levels) {
      if(err) {
        console.error('Error in access of levels: ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        levels = _.map(levels, function(item) {
          return levelFactory.inflate(item).formatTime();
        });
        dfd.resolve(levels);
      }
    });
    return dfd.promise;
  },
  getLevelsInRange: function(rangeEnum) {
    var db = this.db;
    var dfd = defer();
    var map = getLevelRangeMap(rangeEnum);
    db.get(LEVELS_KEY, function(err, levels) {
      if(err) {
        console.error('Error in access levels in range ' + rangeEnum + ': ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        levels = _.map(levels, function(item) {
          return levelFactory.inflate(item).formatTime();
        });
        dfd.resolve(map(levels));
      }
    });
    return dfd.promise;
  },
  addLevelReading: function(level) {
    var db = this.db;
    var dfd = defer();
    var newLevel = levelFactory.inflate(level);
    db.get(LEVELS_KEY, function(err, levels) {
      if(err) {
        console.error('Error in adding level to store: ' + JSON.stringify(newLevel, null, 2) + ', ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
        return;
      }

      db.put(LEVELS_KEY, levels, function(err, data) {
        if(err) {
          console.error('Error in adding level to store: ' + JSON.stringify(newLevel, null, 2) + ', ' + JSON.stringify(err, null, 2));
          dfd.reject(err);
        }
        else {
          dfd.resolve(data);
        }
      });
    });
    return dfd.promise;
  },
  getConfiguration: function() {
    var db = this.db;
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
    var db = this.db;
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
