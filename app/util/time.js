'use strict';

// date is in milliseconds
var SECOND = 60 * 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var YEAR = WEEK * 52;

module.exports = {
  withinDay: function(time) {
    var now = new Date().getTime();
    return (now - time) <= (now - DAY);
  }
};
