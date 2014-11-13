/*global window, Flotr*/
var dom = require('dom');
var xhr = require("json-xhr");
var events = require('component-event');

var host = '@serviceHost';
var port = '@servicePort';
var select = dom('#range-select')[0];
var container = dom('#time-chart')[0];

var debounce = function(delay, fn) {
  var timeout;
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn.apply(null, args);
    }, delay);
  };
};

var data = JSON.parse(decodeURIComponent(container.dataset.reading));
var timeline = function(d) {
  return d.map(function(item) {
    return [item.time, item.level];
  });
};

var options = {
  xaxis: {
    mode: 'time', 
    labelsAngle : 45
  },
  yaxis: {
    min: 0,
    max: 1024
  },
  grid: {
    verticalLines: false,
  },
  selection: {
    mode: 'x'
  },
  HtmlText: true,
  shadowSize: 0
};
var inflateChart = debounce(300, function(d) {
  var o = Flotr._.extend(Flotr._.clone(options), {});
  data = d;
  return Flotr.draw(
    container,
    [d],
    o
  );
});

var getNewRange = function(value) {
  var url = 'http://' + host + ':' + port + '/level?range=' + value;
  xhr(url).then(function(result) {
    inflateChart(timeline(result.response.items));
  }).catch(function(e) {
    console.error(e.message);
  });
};

inflateChart(timeline(data));

events.bind(select, 'change', function(event) {
  event.preventDefault();
  var selection = this.value;
  getNewRange(selection);
});

events.bind(window, 'resize', function(event) {
  event.preventDefault();
  inflateChart(data);
});
