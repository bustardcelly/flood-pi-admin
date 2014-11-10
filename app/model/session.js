'use strict';

module.exports = {
  configuration: undefined,
  init: function(configuration) {
    this.updateConfiguration(configuration);
  },
  withinRange: function(value) {
    console.log('greater: ' + (value >= this.configuration.minimumRange));
    console.log('less: ' + (value <= this.configuration.maximumRange));
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