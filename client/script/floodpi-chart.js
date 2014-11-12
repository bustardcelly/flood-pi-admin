/*global Flotr*/
var dom = require('dom');
var xhr = require("json-xhr");
var events = require('component-event');

var host = '@serviceHost';
var port = '@servicePort';
var select = dom('#range-select')[0];
var container = dom('#time-chart')[0];
var data = JSON.parse(decodeURIComponent(container.dataset.reading));
var timeline = function(d) {
  return d.map(function(item) {
    return [item.time, item.level];
  });
};

var options = {
  xaxis : {
    mode : 'time', 
    labelsAngle : 45
  },
  selection : {
    mode : 'x'
  },
  HtmlText : false,
  title : 'Time'
};
var inflateChart = function(d) {
  var o = Flotr._.extend(Flotr._.clone(options), {});
  return Flotr.draw(
    container,
    [d],
    o
  );
};

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