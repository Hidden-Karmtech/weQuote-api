'use strict';

module.exports.create = function() {

	var Keen = require("keen.io"),
	config = require("./analyticsConfig.js"),
	SEARCH_COLLECTION = 'search',
	NORESULT_COLLECTION = 'noresult',
	SHARE_COLLECTION = 'share';

	var createClient = function() {
		return Keen.configure({
			projectId: config.keenProjectId,
			writeKey: config.keenWriteKey
		});
	};

	var insertSearch = function(options) {
		options.search=options.search.toUpperCase();
		options.author=options.search.toUpperCase();
		options.tag=options.search.toUpperCase();

		createClient.addEvent(SEARCH_COLLECTION,options,function(err, res) {
			if (err) {
				console.log("Errore inserimento statistiche");
			}
		});
	};

	var insertNoResult = function(options) {
		options.search=options.search.toUpperCase();
		options.author=options.search.toUpperCase();
		options.tag=options.search.toUpperCase();

		createClient.addEvent(NORESULT_COLLECTION,options,function(err, res) {
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
		insertNoResult: insertNoResult
	};

};