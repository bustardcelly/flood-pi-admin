'use strict';
var db = require('../db');
var util = require('./route-util');
var session = require('../model/session');
var configFactory = require('../model/configuration');

module.exports = {
  update: function(req, res, next) {
    var d;
    res.setHeader('Access-Control-Allow-Origin','*');
    util.modifyContentType(req, res);

    // TODO: save config in db before setting on session.
    session.configuration = configFactory.inflate(req.params.delay, req.params.range);
    d = {
      result: true
    };
    if(util.isHTMLContentType(res)) {
      d = JSON.stringify(d, null, 2);
    }
    res.send(200, d);
    return next();
  }
};