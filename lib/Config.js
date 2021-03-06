'use strict';

module.exports.create = function() {
	var	dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
		dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
		dbUsername = process.env.OPENSHIFT_MONGODB_DB_USERNAME || require('./local').MONGODB_USERNAME,
		dbPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || require('./local').MONGODB_PASSWORD,
		dbname = 'api',
		serverHost = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
		serverPort = process.env.OPENSHIFT_NODEJS_PORT  || 3000;	

	var getConnectionString = function() {
		return 'mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbname;
	};
		
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
		}
	};	
};