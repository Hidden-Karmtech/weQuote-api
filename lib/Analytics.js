'use strict';

var Keen = require("keen.io"),
	config = require("./analyticsConfig.js"),
	SEARCH_COLLECTION = 'search',
	SHARE_COLLECTION = 'share';

module.exports = {
	
	client : Keen.configure({
				projectId: config.keenProjectId,
				writeKey: config.keenWriteKey
			}),
	
	insertSearch : function(options) {
		if (config.keenProjectId !== 'default') {
			this.client.addEvent(SEARCH_COLLECTION,options,function(err, res) {
			    if (err) {
			    	console.log("Errore inserimento statistiche");
			    }
			});			
		}
	},
	
	insertShare : function(options) {
		if (config.keenProjectId !== 'default') {
			this.client.addEvent(SHARE_COLLECTION,options,function(err, res) {
			    if (err) {
			    	console.log("Errore inserimento statistiche");
			    }
			});			
		}
	}
	
};