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
	MongoRepository = require('./lib/MongoRepository'),
	mongoRepository = MongoRepository.create(mongoose, models),
	Routes = require('./lib/Routes'),
	routes = Routes.create(mongoRepository),
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
app.post('/share', routes.share);
app.get('/tags', routes.tags);
app.put('/update', routes.update);

// Routes di utilità
app.get('/clean', routes.clean);
app.get('/handshake', routes.handshake);
app.get('/removeWrongQuotes', routes.removeWrongQuotes);
app.del('/remove', routes.remove);

// Connessione a MongoDb
mongoose.connect(config.mongo.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(config.node.port, config.node.host, function() {
		console.log("Express server listening on port " + config.node.port);		
	});
});