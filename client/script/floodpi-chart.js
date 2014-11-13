/*global window, Flotr*/
var dom = require('dom');
var xhr = require("json-xhr");
var events = require('component-event');

var host = '@serviceHost';
var port = '@servicePort';
var select = dom('#range-select');
var container = dom('#time-chart');

var config = container[0].dataset.config;
if(typeof config === 'undefined' || config === 'undefined') {
  config = {
    maximumRange: 0,
    minimumRange: 0
  };
}
else {
  config = JSON.parse(decodeURIComponent(config));
}

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

var data = JSON.parse(decodeURIComponent(container[0].dataset.reading));
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

var drawWarningBand = function() {
  var height = config.maximumRange - config.minimumRange;
  var chartHeight = container.contentHeight() - 16;
  var perc = chartHeight / 1024;
  var y = (1024 - config.maximumRange) * perc;
  var b = dom('<div>');
  b.addClass('warning-band');
  b.css('height', (height * perc) + 'px');
  b.css('position', 'relative');
  b.css('top', y + 'px');
  container.append(b);
};

var inflateChart = debounce(300, function(d) {
  var o = Flotr._.extend(Flotr._.clone(options), {});
  data = d;
  Flotr.draw(
    container[0],
    [d],
    o
  );
  drawWarningBand();
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

select.on('change', function(event) {
  event.preventDefault();
  var selection = this.value;
  getNewRange(selection);
});

events.bind(window, 'resize', function(event) {
  event.preventDefault();
  inflateChart(data);
});
