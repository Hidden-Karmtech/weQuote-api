#!/bin/env node

'use strict';

var express = require('express'),
	http = require('http'),
	cors = require('cors'),
	mongoose = require('mongoose'),
	app = express(),
	nodeConfig = require('./lib/nodeConfig'),
	mongoConfig = require('./lib/mongoConfig'),
	routes = require('./lib/routes')(mongoose),
	middlewares = require('./lib/middlewares'),
	passport = require('passport'),	
	passportConfig = require('./lib/passportConfig')(passport),
	db;

// Configurazione passport
passportConfig.initGoogleConfig();
passportConfig.initFacebookConfig();

// Configurazione app
app.use(middlewares.forceHttps);
app.use(express.favicon());
app.use(express.logger());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cors());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/authors', routes.authors);
app.post('/insert', routes.insert);
app.get('/list', routes.list);
app.get('/tags', routes.tags);

// Connessione a MongoDb
mongoose.connect(mongoConfig.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(nodeConfig.port, nodeConfig.host, function() {
		console.log("Express server listening on port " + nodeConfig.port);
	});
});