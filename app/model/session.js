'use strict';

module.exports = {
  configuration: undefined,
  init: function(configuration) {
    this.configuration = configuration;
    console.log('Session configuration updated: ' + JSON.stringify(this.configuration, null, 2));
  },
  withinRange: function(value) {
    return value >= this.configuration.range.minimum && value <= this.configuration.range.maximum;
  }
};