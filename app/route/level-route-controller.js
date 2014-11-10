'use strict';
var db = require('../db');
var util = require('./route-util');
var session = require('../model/session');

module.exports = {
  showCurrent: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    util.modifyContentType(req, res);

    db.getAllLevels()
      .then(function(levelList) {

        var result = {ok: false, error: undefined};
        var last = levelList.length > 0 ? levelList[levelList.length - 1] : undefined;
        if(last !== undefined) {
          if(typeof config !== 'undefined') {
            result.ok = session.withinRange(last.level);
          }
          else {
            result.error = 'Configuration not provided by client.';
          }
        }
        else {
          result.error = 'No reports found.';
        }

        if(util.isHTMLContentType(res)) {
          result = JSON.stringify(result, null, 2);
        }
        res.send(200, 'poo');

      }, function(error) {

        res.send(200, {
          error: error
        });

      });
    return next();
  },
  showAll: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    util.modifyContentType(req, res);

    db.getAllLevels()
      .then(function(levelList) {

        var d = levelList;
        if(util.isHTMLContentType(res)) {
          d = JSON.stringify(levelList, null, 2);
        }
        res.send(200, d);

      }, function(error) {

        res.send(200, {
          error: error
        });

      });
    return next();
  },
  add: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    util.modifyContentType(req, res);

    db.addLevelReading(req.params.level)
      .then(function(data) {

        var d = data || true;
        if(util.isHTMLContentType(res)) {
          d = JSON.stringify(data || {result:true}, null, 2);
        }
        res.send(200, d);

      }, function(error) {
        
        res.send(200, {
          error: error
        });

      });
    return next();
  }
};
