'use strict';

var CONTENT_TYPE_JSON = 'json';
var CONTENT_TYPE_HTML = 'html';

module.exports = {
  modifyContentType: function(req, res) {
    res.contentType = req.accepts('application/json') ? CONTENT_TYPE_JSON : CONTENT_TYPE_HTML;
  },
  isHTMLContentType: function(res) {
    return res.contentType === CONTENT_TYPE_HTML;
  }
};
