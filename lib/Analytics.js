'use strict';

module.exports.create = function() {
	var Keen = require("keen.io"),
	    config = require("./analyticsConfig.js"),
	    SEARCH_COLLECTION = 'search',
	    SHARE_COLLECTION = 'share';
	
	var client = function() {
		return Keen.configure({
			projectId: config.keenProjectId,
			writeKey: config.keenWriteKey
		});
	}
	
	var insertSearch = function(options) {
		client.addEvent(SEARCH_COLLECTION,options,function(err, res) {
		    if (err) {
		    	console.log("Errore inserimento statistiche");
		    }
		});
	};
	
	var insertShare = function(options) {
		client.addEvent(SHARE_COLLECTION,options,function(err, res) {
		    if (err) {
		    	console.log("Errore inserimento statistiche");
		    }
		});
	};
	
};