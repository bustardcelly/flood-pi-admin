'use strict';
var db = require('../db');
var session = require('../model/session');

var RangeEnum = require('../enum/level-time-range');

var isJSONRequest = function(req) {
  return req.is('json') || req.get('Content-type') === 'application/json';
};

module.exports = {
  showCurrent: function(req, res) {
    db.getAllLevels()
      .then(function(levelList) {

        var last = levelList.length > 0 ? levelList[levelList.length - 1] : undefined;
        var result = {
          isFlooded: false,
          data: last,
          overdelay: (last !== undefined) && session.isOverDelay(last.time),
          configuration: session.configuration,
          error: undefined
        };

        if(last !== undefined) {
          if(session.hasConfiguration()) {
            console.log('Last level: ' + last.level);

            result.isFlooded = session.withinRange(parseInt(last.level, 10));
          }
          else {
            result.error = 'Configuration not provided by client.';
          }
        }
        else {
          result.error = 'No reports found.';
        }

        if(isJSONRequest(req)) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('isitflooded', result);
        }

      }, function(error) {

        res.status(404).send({
          error: error
        });

      });
  },
  showAll: function(req, res) {
    db.getAllLevels()
      .then(function(levelList) {

        var result = {
          items:levelList,
          configuration: session.configuration,
          selectedRange: RangeEnum.ALL
        };
        if(isJSONRequest(req)) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('level-listing', result);
        }

      }, function(error) {

        res.status(404).send({
          error: error
        });

      });
  },
  showRange: function(req, res) {
    var range = req.param('range');
    range = range || RangeEnum.DAY;
    db.getLevelsInRange(range)
      .then(function(levelList) {

        var result = {
          items:levelList,
          configuration: session.configuration,
          selectedRange: range
        };
        if(isJSONRequest(req)) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('level-listing', result);
        }

      }, function(error) {

        res.status(404).send({
          error: error
        });

      });
  },
  add: function(req, res) {
    db.addLevelReading(req.param('level'))
      .then(function(data) {

        var result = data || {ok: true};
        res.status(200).json(result);

      }, function(error) {
        
        res.status(404).send({
          error: error
        });

      });
  }
};
