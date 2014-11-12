'use strict';
var db = require('../db');
var session = require('../model/session');
var configFactory = require('../model/configuration');

var isJSONRequest = function(req) {
  return req.is('json') || req.get('Content-type') === 'application/json';
};

module.exports = {
  update: function(req, res) {
    var configuration = configFactory.inflate(req.param('delay'), req.param('range'));
    db.saveConfiguration(configuration)
      .then(function() {
        var result = {
          ok: true
        };

        session.updateConfiguration(configuration);

        if(isJSONRequest(req)) {
          res.status(200).json(result);
        }
        else {
          res.status(200).render('index', result);
        }

      }, function(err) {

        res.status(404).send({
          error: err
        });

      });
  }
};