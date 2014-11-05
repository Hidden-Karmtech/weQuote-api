#!/bin/env node

var express = require('express'),
	http = require('http'),
	mongoose = require('mongoose'),
	app = express(),
	nodejsHost = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	nodeJsPort = process.env.OPENSHIFT_NODEJS_PORT  || 3000,
	mongodbDbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
	mongodbDbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

// Configurazione app
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// Routes
app.get('/list', function(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.end("la list funziona!");
});

mongoose.connect('mongodb://' + mongodbDbHost + ':' + mongodbDbPort + '/api');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(nodeJsPort, nodejsHost, function() {
		console.log("Express server listening on port " + nodeJsPort);
	});
});