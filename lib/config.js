'use strict';

var	dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
	dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
	dbUsername = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
	dbPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'a43H9aZb6iuE',
	dbname = 'api',
	serverHost = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	serverPort = process.env.OPENSHIFT_NODEJS_PORT  || 3000,
	passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	GOOGLE_CLIENT_ID = '1080087919678-dp4kosd8qf8b5tir4kru4jtvo14qdpqq.apps.googleusercontent.com',
	GOOGLE_CLEINT_SECRET = 'SzVovjyQl2VDBwqaPco7WMGF';

var getConnectionString = function() {
	return 'mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbname;
};

var initGoogleConfig = function() {
	passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLEINT_SECRET,
		callbackURL: 'https://api-wequote.rhcloud.com/auth/return'		
	}, function(accessToken, refreshToken, profile, done) {
		console.log("ACCESSTOKEN" + accessToken);
		console.log("REFRESHTOKEN" + refreshToken);
		console.log("PROFILE" + profile);		
	}));
};

var initFacebookConfig = function() {
};

var authenticate = function(strategy, options) {
	if (options) {
		return passport.authenticate(strategy, options);
	} else {
		return passport.authenticate(strategy);
	}	
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