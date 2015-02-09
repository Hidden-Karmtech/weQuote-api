'use strict';

module.exports.create = function() {

	var Keen = require("keen.io"),
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

		createClient.addEvent(SEARCH_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};

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
		
		createClient.addEvent(NORESULT_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
	var insertLogEvent = function(options) {
		createClient.addEvent(EVENTS_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};
	
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