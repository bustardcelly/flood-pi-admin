'use strict';

module.exports = {
  inflate: function(delay, range) {
    return Object.create(Object.prototype, {
      delay: {
        value: delay,
        writable: false,
        enumerable: true
      },
      minimumRange: {
        value: range.minimum,
        writable: false,
        enumerable: true
      },
      maximumRange: {
        value: range.maximum,
        writable: false,
        enumerable: true
      }
    });
  }
};