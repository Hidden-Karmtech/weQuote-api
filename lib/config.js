'use strict';

var	dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
	dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
	dbUsername = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
	dbPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'a43H9aZb6iuE',
	dbname = 'api',
	serverHost = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	serverPort = process.env.OPENSHIFT_NODEJS_PORT  || 3000,
	passport = require('passport'),
	GoogleStrategy = require('passport-google').Strategy,
	realm = 'https://' + serverHost + ':' + serverPort;

var getConnectionString = function() {
	return 'mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbname;
};

var initGoogleConfig = function() {
	passport.use(new GoogleStrategy({
		returnURL: realm + '/auth/return',
		realm: realm
	}, function(identifier, profile, done) {
		console.log("IDENTIFIER" + identifier);
		console.log("PROFILE" + profile);
	}));
};

var initFacebookConfig = function() {
};

var authenticate = function(strategy) {
	return passport.authenticate(strategy);
}

module.exports = {
	mongo: {
		host: dbHost,
		port: dbPort,
		username: dbUsername,
		password: dbPassword,
		getConnectionString:  getConnectionString
	},
	node: {
		host: serverHost,
		port: serverPort
	},
	passport: {
		initGoogleConfig: initGoogleConfig,
		initFacebookConfig: initFacebookConfig,
		authenticate: authenticate
	}
};