'use strict';

module.exports.create = function() {

	var Keen = require("keen.io"),
		_ = require('underscore'),
		config = require("./analyticsConfig.js"),
		EVENTS_COLLECTION = 'events';

	var createClient = (function() {
		return Keen.configure({
			projectId: config.keenProjectId,
			writeKey: config.keenWriteKey
		});
	})();
	
	var insertLogEvent = function(options) {
		
		// Mette in lowercase 'event'
		options.event = options.event.toLowerCase();
		
		if (_.has(options, 'data')) {
			
			// Cancella chiavi di troppo
			delete options.data.event;
			delete options.data.deviceUUID;			

			// Uppercase chiavi	
			var keys = _.keys(options.data);
			_.each(keys, function(key) {
				if (options.data[key]) {
					options.data[key] = options.data[key].toUpperCase();
				}			
			});		
		}
		
		createClient.addEvent(EVENTS_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
	return {
		insertLogEvent : insertLogEvent,
	};

};