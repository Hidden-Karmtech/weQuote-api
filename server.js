#!/bin/env node

'use strict';

var express = require('express'),
	http = require('http'),
	cors = require('cors'),
	mongoose = require('mongoose'),
	models = require('./lib/models')(mongoose),
	app = express(),
	passport = require('passport'),
	config = require('./lib/config')(mongoose, models, passport),
	routes = require('./lib/routes')(mongoose, models),
	middlewares = require('./lib/middlewares'),
	db,
	googleLoginScope = 'https://www.googleapis.com/auth/plus.login';

// Configurazione passport
config.passport.initGoogleConfig();
config.passport.initFacebookConfig();

// Configurazione app
app.use(middlewares.forceHttps);
app.use(express.favicon());
app.use(express.logger());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cors());
app.use(passport.initialize());
//app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/authors', routes.authors);
app.post('/insert', routes.insert);
app.get('/list', routes.list);
app.get('/tags', routes.tags);

// Routes Passport
app.get('/auth/google', config.passport.authenticate('google', {scope: googleLoginScope}));
app.get('/auth/return', config.passport.authenticate('google', {failureRedirect: '/'}), routes.handlePassportAuthentication);

// Connessione a MongoDb
mongoose.connect(config.mongo.getConnectionString());
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
	http.createServer(app).listen(config.node.port, config.node.host, function() {
		console.log("Express server listening on port " + config.node.port);
	});
});