'use strict';
var db = require('../db');

var CONTENT_TYPE_JSON = 'json';
var CONTENT_TYPE_HTML = 'html';

var modifyContentType = function(req, res) {
  res.contentType = req.accepts('application/json') ? CONTENT_TYPE_JSON : CONTENT_TYPE_HTML;
};

var isHTMLContentType = function(res) {
  return res.contentType === CONTENT_TYPE_HTML;
};

module.exports = {
  showAll: function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    modifyContentType(req, res);

    db.getAllLevels()
      .then(function(levelList) {

        var d = levelList;
        if(isHTMLContentType(res)) {
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
    modifyContentType(req, res);

    db.addLevelReading(req.params.level)
      .then(function(data) {

        var d = data || true;
        if(isHTMLContentType(res)) {
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
