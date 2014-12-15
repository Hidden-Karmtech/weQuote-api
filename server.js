#!/bin/env node

'use strict';

var express = require('express'),
	http = require('http'),
	cors = require('cors'),
	mongoose = require('mongoose'),
	app = express(),
	db,
	Models = require('./lib/Models'),
	models = Models.create(mongoose),
	Config = require('./lib/Config'),
	config = Config.create(),
	Routes = require('./lib/Routes'),
	routes = Routes.create(mongoose, models),
	Middlewares = require('./lib/Middlewares'),
	middlewares = Middlewares.create();
	
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
app.get('/quoteExists', routes.quoteExists);
app.get('/tags', routes.tags);

// Connessione a MongoDb
mongoose.connect(config.mongo.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(config.node.port, config.node.host, function() {
		console.log("Express server listening on port " + config.node.port);		
		
		/*
		models.populateOmniSearch();
		*/
		
	});
});