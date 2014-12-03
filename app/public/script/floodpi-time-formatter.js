(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dom = require('dom');
var items = dom('.last-reading-date');
var REGEX = /(.*)( GMT.*)/g;

items.forEach(function(item) {
  var offset = (new Date().getTimezoneOffset() * (60 * 1000));
  var str = new Date(parseInt(item.dataset.time, 10) - offset).toString();
  item.innerHTML = REGEX.exec(str)[1];
});
},{"dom":2}],2:[function(require,module,exports){

var domify = require('./lib/domify');
var classes = require('./lib/classes');
var matches = require('./lib/matches');
var event = require('./lib/event');
var mutation = require('./lib/mutation');

/**
 * Expose `dom()`.
 */

exports = module.exports = dom;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List}
 * @return {List}
 * @api public
 */

function dom(selector, context) {

  // user must specify a selector
  if (!selector) {
    throw new Error('no selector specified');
  }

  // array
  if (selector instanceof Array) {
    return new List(selector);
  }

  var ctx = context;

  // if no context, then use document
  if (!ctx) {
    ctx = document;
  }
  // if context is another list, use the first element
  else if (ctx instanceof List) {
    ctx = context[0];
  }

  // flatten out a nodelist into regular array
  if (selector instanceof NodeList) {
    var arr = [];
    for (var i=0; i<selector.length ; ++i) {
      arr.push(selector[i]);
    }
    return new List(arr, selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  // if selector is a string, trim off leading and trailing whitespace
  if (typeof selector === 'string') {
    selector = selector.trim();
  }

  // html
  if ('<' == selector.charAt(0)) {
    return dom(domify(selector));
  }

  // selector
  if ('string' == typeof selector) {
    return dom(ctx.querySelectorAll(selector), selector);
  }
}

/**
 * Expose `List` constructor.
 */

exports.List = List;

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  Array.prototype.push.apply(this, els);
  this.selector = selector;
}

// for minifying
var proto = List.prototype;

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

proto.attr = function(name, val) {
  if (val === undefined) {
    return this[0].getAttribute(name);
  }

  this[0].setAttribute(name, val);
  return this;
};

proto.removeAttr = function(name) {
  this[0].removeAttribute(name);
  return this;
};

// set or get the data attribute for the first element in the list
proto.data = function(key, value) {
  return this.attr('data-' + key, value);
};

/**
 * Return a cloned `List` with all elements cloned.
 *
 * @return {List}
 * @api public
 */

proto.clone = function(){
  var arr = [];
  for (var i = 0, len = this.length; i < len; ++i) {
    arr.push(this[i].cloneNode(true));
  }
  return new List(arr);
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

proto.at = function(i){
  return new List([this[i]], this.selector);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

proto.first = function(){
  return new List([this[0]], this.selector);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

proto.last = function(){
  return new List([this[this.length - 1]], this.selector);
};

/**
 * Return list length.
 *
 * @return {Number}
 * @api public
 */

proto.length = function() {
  return this.length;
};

/**
 * Return element text.
 *
 * @return {String}
 * @api public
 */

proto.text = function(val) {
  if (val !== undefined) {
    this[0].textContent = val;
    return this;
  }

  var str = '';
  for (var i = 0; i < this.length; ++i) {
    str += this[i].textContent;
  }
  return str;
};

/**
 * Return element html.
 *
 * @return {String}
 * @api public
 */

proto.html = function(val){
  var el = this[0];

  if (val) {
    if (typeof(val) !== 'string') {
      throw new Error('.html() requires a string');
    }

    el.innerHTML = val;
    return this;
  }

  return el.innerHTML;
};

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

proto.on = function(name, selector, fn, capture) {
  if ('string' == typeof selector) {

    var el = this[0];
    var deleg = function(e) {
      var target = e.target;
      do {
        if (matches(target, selector)) {

          var Event = function(e) {
            for (var k in e) {
              this[k] = e[k];
            }
          };

          // craete a new 'event' object
          // so we can replace the 'currentTarget' field
          var new_ev = new Event(e);

          // replace the current target
          new_ev.currentTarget = target;

          return fn.call(target, new_ev);
        }
        target = target.parentElement;
      } while (target && target !== el);
    }

    // TODO(shtylman) synthesize this event
    if (name === 'mouseenter') {
      name = 'mouseover';
    }

    for (var i = 0; i < this.length; ++i) {
      fn._delegate = deleg;
      event.bind(this[i], name, deleg, capture);
    }
    return this;
  }

  //TODO(shtylman) why not just override the fn and bind that?

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.length; ++i) {
    event.bind(this[i], name, fn, capture);
  }

  return this;
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

proto.off = function(name, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.length; ++i) {
      // TODO: add selector support back
      delegate.unbind(this[i], name, fn._delegate, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.length; ++i) {
    event.unbind(this[i], name, fn, capture);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

proto.each = function(fn) {
  for (var i = 0; i < this.length; ++i) {
    fn(new List([this[i]], this.selector), i);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(el, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

proto.forEach = function(fn) {
  Array.prototype.forEach.call(this, fn);
  return this;
};

/**
 * Map elements invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

proto.map = function(fn){
  return Array.prototype.map.call(this, fn);
};

proto.select = function() {
  for (var i=0; i<this.length ; ++i) {
    var el = this[i];
    el.select();
  };

  return this;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a truthy value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

proto.filter = function(fn) {
  var els = Array.prototype.filter.call(this, function(el) {
    return fn(new List([el], this.selector));
  });
  return new List(els, this.selector);
};

proto.value = function(val) {
  var el = this[0];
  if (val) {
    el.value = val;
    return this
  }

  return el.value;
};

proto.offset = function() {
  var el = this[0];
  var curleft = 0;
  var curtop = 0;

  if (el.offsetParent) {
    do {
      curleft += el.offsetLeft;
      curtop += el.offsetTop;
    } while (el = el.offsetParent);
  }

  return {
    left: curleft,
    top: curtop
  }
};

proto.position = function() {
  var el = this[0];
  return {
    top: el.offsetTop,
    left: el.offsetLeft
  }
};

/// includes border
proto.outerHeight = function() {
  return this[0].offsetHeight;
};

/// no border, includes padding
proto.innerHeight = function() {
  return this[0].clientHeight;
};

/// no border, no padding
/// this is slower than the others because it must get computed style values
proto.contentHeight = function() {
  var style = window.getComputedStyle(this[0], null);
  var ptop = style.getPropertyValue('padding-top').replace('px', '') - 0;
  var pbot = style.getPropertyValue('padding-bottom').replace('px', '') - 0;

  return this.innerHeight() - ptop - pbot;
};

proto.scrollHeight = function() {
  return this[0].scrollHeight;
};

/// includes border
proto.outerWidth = function() {
  return this[0].offsetWidth;
};

/// no border, includes padding
proto.innerWidth = function() {
  return this[0].clientWidth;
};

/// no border, no padding
/// this is slower than the others because it must get computed style values
proto.contentWidth = function() {
  var style = window.getComputedStyle(this[0], null);
  var pleft = style.getPropertyValue('padding-left').replace('px', '') - 0;
  var pright = style.getPropertyValue('padding-right').replace('px', '') - 0;

  return this.innerWidth() - pleft - pright;
};

proto.scrollWidth = function() {
  return this[0].scrollWidth;
};

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

proto.addClass = function(name){
  var el;
  for (var i = 0; i < this.length; ++i) {
    el = this[i];
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  }
  return this;
};

/**
 * Remove the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

proto.removeClass = function(name){
  var el;
  for (var i = 0; i < this.length; ++i) {
    el = this[i];
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  }
  return this;
};

/**
 * Toggle the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

proto.toggleClass = function(name){
  var el;
  for (var i = 0; i < this.length; ++i) {
    el = this[i];
    el._classes = el._classes || classes(el);
    el._classes.toggle(name);
  }
  return this;
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

proto.hasClass = function(name){
  var el;
  for (var i = 0; i < this.length; ++i) {
    el = this[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }
  return false;
};

/**
 * Set CSS `prop` to `val` or get `prop` value.
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {List|String}
 * @api public
 */

proto.css = function(prop, val){
  if (prop instanceof Object) {
    for(var p in prop) {
      this.setStyle(p, prop[p]);
    }
  }

  if (2 == arguments.length) {
    return this.setStyle(prop, val);
  }

  return this.getStyle(prop);
};

/**
 * Set CSS `prop` to `val`.
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {List} self
 * @api private
 */

proto.setStyle = function(prop, val){
  for (var i = 0; i < this.length; ++i) {
    this[i].style[prop] = val;
  }
  return this;
};

/**
 * Get CSS `prop` value.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

proto.getStyle = function(prop) {
  var el = this[0];
  if (el) return el.style[prop];
};

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

proto.find = function(selector) {
  return dom(selector, this);
};

proto.next = function() {
  var els = [];
  for (var i=0 ; i<this.length ; ++i) {
    var next = this[i].nextElementSibling;
    // if no more siblings then don't push
    if (next) {
      els.push(next);
    }
  }

  return new List(els);
};

proto.prev = function() {
  var els = [];
  for (var i=0 ; i<this.length ; ++i) {
    var next = this[i].previousElementSibling;
    // if no more siblings then don't push
    if (next) {
      els.push(next);
    }
  }
  return new List(els);
};

proto.emit = function(name, opt) {
  event.emit(this[0], name, opt);
  return this;
};

proto.parent = function() {
  var els = [];
  for (var i=0 ; i<this.length ; ++i) {
    els.push(this[i].parentNode);
  }

  return new List(els);
};

/// mutation

proto.prepend = function(what) {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.prepend(this[i], dom(what));
  }
  return this;
};

proto.append = function(what) {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.append(this[i], dom(what));
  }
  return this;
};

proto.before = function(what) {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.before(this[i], dom(what));
  }
  return this;
};

proto.after = function(what) {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.after(this[i], dom(what));
  }
  return this;
};

proto.remove = function() {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.remove(this[i]);
  }
};

proto.replace = function(what) {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.replace(this[i], dom(what));
  }
  return this;
};

// note, we don't do .find('*').remove() here for efficiency
proto.empty = function() {
  for (var i=0 ; i<this.length ; ++i) {
    mutation.empty(this[i]);
  }
  return this;
};


},{"./lib/classes":3,"./lib/domify":4,"./lib/event":5,"./lib/matches":7,"./lib/mutation":8}],3:[function(require,module,exports){

// whitespace regex to avoid creating every time
var re = /\s+/;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = arr.indexOf(name);
  if (!~i) {
    arr.push(name);
  }
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = arr.indexOf(name);
  if (~i) {
    arr.splice(i, 1);
  }
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    return this.remove(name);
  }

  return this.add(name);
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var arr = this.el.className.split(re);
  if ('' === arr[0]) {
    arr.pop();
  }
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~this.array().indexOf(name);
};

},{}],4:[function(require,module,exports){

/**
 * Wrap map from jquery.
 */

var map = {
    option: [1, '<select multiple="multiple">', '</select>'],
    optgroup: [1, '<select multiple="multiple">', '</select>'],
    legend: [1, '<fieldset>', '</fieldset>'],
    thead: [1, '<table>', '</table>'],
    tbody: [1, '<table>', '</table>'],
    tfoot: [1, '<table>', '</table>'],
    colgroup: [1, '<table>', '</table>'],
    caption: [1, '<table>', '</table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    _default: [0, '', '']
};

/**
 * Convert the given `html` into DOM elements.
 * @return {Array} of html elements
 *
 * @api public
 */

module.exports = function(html){
    if (typeof html !== 'string') {
        throw new TypeError('String expected');
    }

    // tag name
    var m = /<([\w:]+)/.exec(html);
    if (!m) throw new Error('No elements were generated.');
    var tag = m[1];

    // body support
    if (tag == 'body') {
        var el = document.createElement('html');
        el.innerHTML = html;
        return [el.removeChild(el.lastChild)];
    }

    var elements = [];

    // wrap map
    var wrap = map[tag] || map._default;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var el = document.createElement('div');
    el.innerHTML = prefix + html + suffix;

    // trim away wrapper elements
    while (depth--) {
        el = el.lastChild;
    };

    var els = [];

    var child = el.firstChild;
    do {
        els.push(child);
    } while (child = child.nextElementSibling);

    for (var i=0 ; i<els.length ; ++i) {
        el.removeChild(els[i]);
    }

    return els;
};

},{}],5:[function(require,module,exports){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
*/

exports.bind = function(el, type, fn, capture) {
    if (el.addEventListener) {
        el.addEventListener(type, fn, capture || false);
    } else {
        el.attachEvent('on' + type, fn);
    }

    return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
*/

exports.unbind = function(el, type, fn, capture) {
    if (el.removeEventListener) {
        el.removeEventListener(type, fn, capture || false);
    } else {
        el.detachEvent('on' + type, fn);
    }
    return fn;
};

exports.emit = function(el, name, opts) {
    opts = opts || {};
    var type = typeOf(name);

    var ev = document.createEvent(type + 's');

    // initKeyEvent in firefox
    // initKeyboardEvent in chrome

    var init = typeof ev['init' + type] === 'function'
      ? 'init' + type : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = name;

    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        args.push(val);
    }
    ev[init].apply(ev, args);

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return el.dispatchEvent(ev);
};

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":6,"./types.json":9}],6:[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],7:[function(require,module,exports){

var proto = Element.prototype;

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

module.exports = function match(el, selector) {
    if (vendor) {
        return vendor.call(el, selector);
    }

    var nodes = el.parentNode.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i] == el) {
            return true;
        }
    }

    return false;
};

},{}],8:[function(require,module,exports){

function mkfragment(elements) {
    var frag = document.createDocumentFragment();

    for (var i=0 ; i<elements.length ; ++i) {
        frag.appendChild(elements[i]);
    }

    return frag;
};

module.exports.remove = function(el) {
    if (!el.parentNode) {
        return;
    }
    return el.parentNode.removeChild(el);
};

module.exports.replace = function(el, what) {
    if (!el.parentNode) {
        return;
    }
    return el.parentNode.replaceChild(mkfragment(what), el);
};

module.exports.prepend = function(el, what) {
    return el.insertBefore(mkfragment(what), el.firstChild);
};

module.exports.append = function(el, what) {
    var frag = document.createDocumentFragment();
    return el.appendChild(mkfragment(what));
};

// returns newly inserted element
module.exports.after = function(el, what) {
    if (!el.parentNode) {
        return;
    }

    // ie9 doesn't like null for insertBefore
    if (!el.nextSilbling) {
        return el.parentNode.appendChild(mkfragment(what));
    }

    return el.parentNode.insertBefore(mkfragment(what), el.nextSilbling);
};

module.exports.before = function(el, what) {
    if (!el.parentNode) {
        return;
    }
    return el.parentNode.insertBefore(mkfragment(what), el);
};

module.exports.empty = function(parent) {
    // cheap way to remove all children
    parent.innerHTML = '';
};


},{}],9:[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvent" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}]},{},[1])