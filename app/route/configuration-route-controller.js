'use strict';
var db = require('../db');
var session = require('../model/session');
var configFactory = require('../model/configuration');

module.exports = {
  update: function(req, res) {
    var result;
    // TODO: save config in db before setting on session.
    session.configuration = configFactory.inflate(req.params.delay, req.params.range);
    result = {
      ok: true
    };
    if(req.is('json')) {
      res.status(200).json(result);
    }
    else {
      res.status(200).render('index', result);
    }
  }
};