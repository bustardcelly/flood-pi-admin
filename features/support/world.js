'use strict';

var db = require('../../app/db');

var World = function World(callback) {

  this.createDBReference = function() {
    return {
      get: function(name, callback) {
      },
      post: function(name, value, callback) {

      }
    };
  };
  this.establishDB = function(dbReference) {
    db.init(dbReference);
  };

  callback();
  
};

module.exports.World = World;