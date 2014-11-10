'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var consolidate = require('consolidate');
var Handlebars = require('handlebars');

var argsv = require('minimist')(process.argv.slice(2));
var version = require(path.join(process.cwd(), 'package.json')).version;

// Server configuration.
var PORT = argsv.port || 8001;
var DB_NAME = argsv.db || 'floodpi';

var db = require('./db');
var levelRouteController = require('./route/level-route-controller');
var configurationRouteController = require('./route/configuration-route-controller');

var app = express();
app.set('port', PORT);

app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', levelRouteController.showCurrent);
app.get('/level', levelRouteController.showAll);
app.post('/level', levelRouteController.add);
app.post('/configuration', configurationRouteController.update);

var partials = path.join(__dirname, 'views', 'partials');
fs.readdirSync(partials).forEach(function (file) {
    var source = fs.readFileSync(path.join(partials, file), 'utf8'),
        partial = /(.+)\.html/.exec(file).pop();
    Handlebars.registerPartial(partial, source);
});

app.listen(PORT, function() {
  console.log('flood-pi-admin %s server started at %s.', version, JSON.stringify(app, null, 2));
  db.init(DB_NAME)
    .then(db.inflate, function(err) {
      console.error(err);
    });
});