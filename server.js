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
	db;

// Configurazione app
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
app.get('/list', routes.list);
app.post('/insert', routes.insert);

// Connessione a MongoDb
mongoose.connect(mongoConfig.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(nodeConfig.port, nodeConfig.host, function() {
		console.log("Express server listening on port " + nodeConfig.port);
	});
});