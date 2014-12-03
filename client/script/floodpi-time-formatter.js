var dom = require('dom');
var items = dom('.last-reading-date');
var REGEX = /(.*)( GMT.*)/g;

items.forEach(function(item) {
  var offset = (new Date().getTimezoneOffset() * (60 * 1000));
  var str = new Date(parseInt(item.dataset.time, 10) - offset).toString();
  item.innerHTML = REGEX.exec(str)[1];
});