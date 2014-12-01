'use strict';

// date is in milliseconds
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var YEAR = WEEK * 52;

module.exports = {
  dayAgo: function(time) {
    return time - DAY;
  },
  weekAgo: function(time) {
    return time - WEEK;
  },
  yearAgo: function(time) {
    return time - YEAR;
  },
  withinDay: function(time) {
    var now = new Date().getTime();
    return (now - time) <= DAY;
  },
  withinWeek: function(time) {
    var now = new Date().getTime();
    return (now - time) <= WEEK;
  },
  withinYear: function(time) {
    var now = new Date().getTime();
    return (now - time) <= YEAR;
  }
};
