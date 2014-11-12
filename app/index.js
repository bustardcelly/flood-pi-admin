'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Handlebars = require('handlebars');
var expressHbs = require('express-handlebars');

var levelup = require('levelup');

var argsv = require('minimist')(process.argv.slice(2));
var version = require(path.join(process.cwd(), 'package.json')).version;

// Server configuration.
var PORT = argsv.port || 8001;
var DB_NAME = argsv.db || 'floodpi';

var db = require('./db');
var session = require('./model/session');
var levelRouteController = require('./route/level-route-controller');
var configurationRouteController = require('./route/configuration-route-controller');

var views = path.join(__dirname, 'views');
var layouts = path.join(views, 'layouts');
var partials = path.join(views, 'partials');

var app = express();
app.set('port', PORT);

app.engine('html', expressHbs({
  extname:'html', 
  defaultLayout:'index.html',
  layoutsDir: layouts
}));

app.set('view engine', 'html');
app.set('view options', {layout: true});
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/isitflooded', levelRouteController.showCurrent);
app.get('/', levelRouteController.showAll);
app.get('/level', levelRouteController.showRange);
app.post('/level', levelRouteController.add);
app.post('/configuration', configurationRouteController.update);

fs.readdirSync(partials).forEach(function (file) {
    var source = fs.readFileSync(path.join(partials, file), 'utf8'),
        partial = /(.+)\.html/.exec(file);

    if(partial) {
      Handlebars.registerPartial(partial.pop(), source);
    }
});

Handlebars.registerHelper('json', function(obj) {
  return new Handlebars.SafeString(JSON.stringify(obj));
});

var timespan = require('timespan');
Handlebars.registerHelper('datefrom', function(time) {
  var ts = timespan.fromDates(new Date(time), new Date());
  return ts.days + ' days ' +
          ts.hours + ' hours ' +
          ts.minutes + ' minutes ' +
          ts.seconds + ' seconds ' +
          'ago';
});

app.listen(PORT, function() {
  console.log('flood-pi-admin %s server started on %s.', version, app.get('port'));
  var levelUpDB;
  var generateDBError = function(msg) {
      return 'Error in establishing DB with name ' + DB_NAME + ': ' + msg;
    };

  levelUpDB = levelup(DB_NAME, {
    valueEncoding: 'json'
  }, function(err) {
    if(err) {
      console.error(generateDBError(JSON.stringify(err, null, 2)));
      process.exit();
    }
    else {
    db.init(levelUpDB)
      .then(db.inflate.bind(db), function(err) {
        console.error('Could not inflate db: ' + err);
      })
      .then(db.getConfiguration.bind(db), function(err) {
        console.error('Could not access already stored configuration: ' + err);
      })
      .then(session.init.bind(session), function(err) {
        console.error('Could not init session with stored configuration: ' + err);
      });
    }
  });
});