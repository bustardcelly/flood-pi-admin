'use strict';
var db = require('../db');
var session = require('../model/session');

module.exports = {
  showCurrent: function(req, res) {
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

        if(req.is('json')) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('index', result);
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

        var result = levelList;
        if(req.is('json')) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('index', result);
        }

      }, function(error) {

        res.status(404).send({
          error: error
        });

      });
  },
  add: function(req, res) {
    db.addLevelReading(req.params.level)
      .then(function(data) {

        var result = data || true;
        if(req.is('json')) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('index', result);
        }

      }, function(error) {
        
        res.status(404).send({
          error: error
        });

      });
  }
};
