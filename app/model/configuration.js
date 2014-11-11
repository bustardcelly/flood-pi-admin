'use strict';

var configuration = {
  // delay assigned is in minutes.
  delayInSeconds: function() {
    return this.delay * 60;
  },
  delayInMilliseconds: function() {
    return this.delayInSeconds() * 1000;
  }
};

module.exports = {
  inflate: function(delay, range) {
    return Object.create(configuration, {
      delay: {
        value: delay,
        writable: false,
        enumerable: true
      },
      minimumRange: {
        value: parseInt(range.minimum, 10),
        writable: false,
        enumerable: true
      },
      maximumRange: {
        value: parseInt(range.maximum, 10),
        writable: false,
        enumerable: true
      }
    });
  }
};