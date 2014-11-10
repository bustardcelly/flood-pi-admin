'use strict';

var generate = function(level, time, writable) {
  return Object.create(Object.prototype, {
            level: {
              value: level,
              writable: writable,
              enumerable: true
            },
            time: {
              value: time || new Date().getTime(),
              writable: writable,
              enumerable: true
            }
          });
};

module.exports = {
  create: function(level, time) {
    return generate(level, time, true);
  },
  inflate: function(level, time) {
    return generate(level, time, false);
  }
};
