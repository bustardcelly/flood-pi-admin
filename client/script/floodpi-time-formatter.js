var dom = require('dom');
var items = dom('.last-reading-date');

items.forEach(function(item) {
  item.innerHTML = new Date(item.innerHTML + ' UTC').toString();
});