'use strict';

module.exports = function(mongoose, models, passport) {
	var	dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
		dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
		dbUsername = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
		dbPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'a43H9aZb6iuE',
		dbname = 'api',
		serverHost = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
		serverPort = process.env.OPENSHIFT_NODEJS_PORT  || 3000,
		serverPublishedUrl = 'https://api-wequote.rhcloud.com/auth/return',		
		GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
		GOOGLE_CLIENT_ID = '1080087919678-dp4kosd8qf8b5tir4kru4jtvo14qdpqq.apps.googleusercontent.com',
		GOOGLE_CLEINT_SECRET = 'SzVovjyQl2VDBwqaPco7WMGF';
	
	var getConnectionString = function() {
		return 'mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbname;
	};
	
	var initGoogleConfig = function() {
		var userProfile;
		
		passport.use(new GoogleStrategy({
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLEINT_SECRET,
			callbackURL: serverPublishedUrl,		
		}, function(accessToken, refreshToken, profile, done) {								
			models.UserProfile.find({id: profile._json.id}, null, null, function(err, docs) {
				if (err) {
					done(err, null);
				} else {
					if (0 === docs.length) {
						userProfile = new models.UserProfile({
							provider: 'google',
							id: profile._json.id,
							name: profile._json.name,
							givenName: profile._json.given_name,
							familyName: profile._json.family_name,
							link: profile._json.link,
							picture: profile._json.picture,
							gender: profile._json.gender,
							locale: profile._json.locale
						});
						userProfile.save(function(err, inserted, affected) {
							done(err, inserted);
						});			
					} else {						
						done(err, docs[0]);	
					}
				}
			});						
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

	return {
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
};