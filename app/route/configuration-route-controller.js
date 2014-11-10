'use strict';
var db = require('../db');
var session = require('../model/session');
var configFactory = require('../model/configuration');

module.exports = {
  update: function(req, res) {
    var configuration = configFactory.inflate(req.param('delay'), req.param('range'));
    db.saveConfiguration(configuration)
      .then(function() {
        var result = {
          ok: true
        };

        session.updateConfiguration(configuration);

        if(req.is('json')) {
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