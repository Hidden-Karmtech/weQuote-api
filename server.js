#!/bin/env node

'use strict';

var express = require('express'),
	http = require('http'),
	cors = require('cors'),
	mongoose = require('mongoose'),
	app = express(),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	methodOverride = require('method-override'),
	db,
	Models = require('./lib/Models'),
	models = Models.create(mongoose),
	Config = require('./lib/Config'),
	config = Config.create(),
	MongoRepository = require('./lib/MongoRepository'),
	mongoRepository = MongoRepository.create(mongoose, models),
	Routes = require('./lib/Routes'),
	routes = Routes.create(mongoRepository),
	RoutesDef = require('./lib/RoutesDef'),
	Middlewares = require('./lib/Middlewares'),
	middlewares = Middlewares.create();
	
// Configurazione app
app.use(middlewares.forceHttps);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride);
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Definizione routes
var router = express.Router();
RoutesDef.define(router, routes);

// Connessione a MongoDb
mongoose.connect(config.mongo.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(config.node.port, config.node.host, function() {
		console.log("Express server listening on port " + config.node.port);		
	});
});