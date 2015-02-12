'use strict';

module.exports.create = function() {

	var Keen = require("keen.io"),
		_ = require('underscore'),
		config = require("./analyticsConfig.js"),
		SEARCH_COLLECTION = 'search',
		NORESULT_COLLECTION = 'noresult',
		SHARE_COLLECTION = 'share',
		EVENTS_COLLECTION = 'events';

	var createClient = (function() {
		return Keen.configure({
			projectId: config.keenProjectId,
			writeKey: config.keenWriteKey
		});
	})();
	
	// Deprecato
	var insertSearch = function(options) {
		if (options.search) {
			options.search=options.search.toUpperCase();
		}
		if (options.author) {
			options.author=options.author.toUpperCase();
		}
		if (options.tag) {
			options.tag=options.tag.toUpperCase();
		}

		createClient.addEvent(EVENTS_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
	// Deprecato
	var insertNoResult = function(options) {		
		if (options.search) {
			options.search=options.search.toUpperCase();
		}
		if (options.author) {
			options.author=options.author.toUpperCase();
		}
		if (options.tag) {
			options.tag=options.tag.toUpperCase();
		}
		
		createClient.addEvent(EVENTS_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
	var insertLogEvent = function(options) {
		
		if (_.has(options, 'data')) {
			
			// Cancella chiavi di troppo
			delete options.data.event;
			delete options.data.deviceUUID;			

			// Uppercase chiavi	
			var keys = _.keys(options.data);
			_.each(keys, function(key) {
				if (options[key]) {
					options[key] = options[key].toUpperCase();
				}			
			});		
		}
		
		createClient.addEvent(EVENTS_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
	// Deprecato
	var insertShare = function(options) {
		createClient.addEvent(SHARE_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};

	return {
		insertSearch : insertSearch,
		insertShare : insertShare,
		insertLogEvent : insertLogEvent,
		insertNoResult: insertNoResult
	};

};