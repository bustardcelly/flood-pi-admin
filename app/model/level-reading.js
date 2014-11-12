'use strict';

var levelReading = {
  formattedTime: undefined,
  formatTime: function() {
    this.formattedTime =  new Date(this.time);
  }
};

var generate = function(level, time, writable) {
  return Object.create(levelReading, {
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
