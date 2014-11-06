'use strict';
var levelup = require('levelup');
var defer = require('node-promise').defer;

var db;
var LEVELS_KEY = 'levels';

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
    var dfd = defer();
    db.get(LEVELS_KEY, function(err, value) {
      if(err) {
        console.error('Error in access of levels: ' + JSON.stringify(err, null, 2));
        dfd.reject(err);
      }
      else {
        dfd.resolve(value);
      }
    });
    return dfd.promise;
  }
};
