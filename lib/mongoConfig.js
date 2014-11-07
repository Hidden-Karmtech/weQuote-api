'use strict';

var	host = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
	port = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
	username = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
	password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'a43H9aZb6iuE',
	dbname = 'api';

var getConnectionString = function() {
	return 'mongodb://' + username + ':' + password + '@' + host + ':' + port + '/' + dbname;
};

module.exports = {
	host: host,
	port: port,
	username: username,
	password: password,
	getConnectionString:  getConnectionString
};