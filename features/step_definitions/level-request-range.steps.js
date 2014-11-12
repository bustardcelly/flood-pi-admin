/*jshint unused:false*/
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var defer = require('node-promise').defer;

chai.use(sinonChai);

var db = require('../../app/db');
var levelFactory = require('../../app/model/level-reading');

module.exports = function() {
  'use strict';

  var result;
  var randomRange = function(min, max) {
    return Math.floor(min + (Math.random() * (max - min)));
  };
  var hourToMilliseconds = function(value) {
    return value * 60 * 60 * 1000;
  };
  var generateReadings = function(amount, milliSpan) {
    var list = [];
    var now = new Date().getTime();
    while(--amount > -1) {
      list.push(levelFactory.create(randomRange(0, 1024), randomRange(now, now - milliSpan)));
    }
    return list;
  };

  this.World = require('../support/world').World;

  this.Given(/^There are (\d+) level readings store for the current (\d+) hour period$/, function (arg1, arg2, callback) {
    var totalAmount = parseInt(arg1, 10);
    var hourAmount = parseInt(arg2, 10);
    // this = World
    var dbInterface = this.createDBReference();
    this.establishDB(dbInterface);

    sinon.stub(dbInterface, 'get', function(name, callback) {
      callback(null, generateReadings(totalAmount, hourToMilliseconds(hourAmount)));
    });
    callback();
  });

  this.When(/^I request a range of "([^"]*)"$/, function (rangeEnum, callback) {
    var promise = db.getLevelsInRange(rangeEnum);
    promise.then(function(levels) {
      result = levels;
      callback();
    }, function(err) {
      console.error(JSON.stringify(err, null, 2));
      expect(err).to.equal(undefined);
      callback();
    });
  });

  this.Then(/^I am returned (\d+) level readings$/, function (arg1, callback) {
    var expectedAmount = parseInt(arg1, 10);
    expect(result.length).to.equal(expectedAmount);
    callback();
  });

};
