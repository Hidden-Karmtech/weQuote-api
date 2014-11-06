#!/bin/env node

var express = require('express'),
	http = require('http'),
	mongoose = require('mongoose'),	
	app = express(),	
	nodeConfig = require('./lib/nodeConfig'),
	mongoConfig = require('./lib/mongoConfig'),
	routes = require('./lib/routes')(mongoose);

// Configurazione app
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// Routes
app.get('/list', routes.list);
app.get('/insert', routes.insert);

mongoose.connect(mongoConfig.getConnectionString());

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(nodeConfig.port, nodeConfig.host, function() {
		console.log("Express server listening on port " + nodeConfig.port);
	});
});