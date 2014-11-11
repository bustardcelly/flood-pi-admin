'use strict';

module.exports = {
  configuration: undefined,
  init: function(configuration) {
    this.updateConfiguration(configuration);
  },
  isOverDelay: function(value) {
    return (new Date().getTime() - value) > this.configuration.delayInMilliseconds();
  },
  withinRange: function(value) {
    return value >= this.configuration.minimumRange && value <= this.configuration.maximumRange;
  },
  updateConfiguration: function(value) {
    this.configuration = value;
    console.log('Session configuration updated: ' + JSON.stringify(this.configuration, null, 2));
  },
  hasConfiguration: function() {
    return this.configuration !== undefined;
  }
};