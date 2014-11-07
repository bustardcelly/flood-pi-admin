'use strict';
var db = require('../db');

module.exports = {
  showAll: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    db.getAllLevels()
      .then(function(levelList) {
        res.send(200, 'hello, world!\n' + JSON.stringify(levelList, null, 2));
      }, function(error) {
        res.send(200, {
          error: error
        });
      });
    return next();
  },
  add: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    db.addLevelReading(req.params.level)
      .then(function(data) {
        res.send(200, data || true);
      }, function(error) {
        res.send(200, {
          error: error
        });
      });
    return next();
  }
};
