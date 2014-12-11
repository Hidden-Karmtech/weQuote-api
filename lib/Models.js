'use strict';

module.exports.create = function(mongoose) {
	var random = require('mongoose-random');
	
	/**
	 * Schemi
	 */
	var QuoteSchema = new mongoose.Schema({
		text: {type: String, required: true},
		author: {type: String, required: true},
		tags: [{
			name: {type: String, required: true}
		}],
		source: String,
		omniSearch: String
	}, {
		collection: 'quote'
	});
	QuoteSchema.plugin(random, { path: 'r' });
	
	var UserProfileSchema = new mongoose.Schema({		
		id: {type: String, required: true},
		name: {type: String, required: true},
		givenName: {type: String},
		familyName: {type: String},		
		link: {type: String},
		picture: {type: String},
		gender: {type: String},
		locale: {type: String},
		credits: {type: Number, min: 0},
		devices: [{
			UUID: {type: String, required: true}
		}]
	}, {
		collection: 'userProfile'
	}); 
	
	var HistorySchema = new mongoose.Schema({		
		userProfileId: {type: String, required: true},
		eventType: {type: String, required: true},
		eventDateTime: {type: Date, required: true},
		query: {type: String, required: true},
		
	}, {
		collection: 'userProfile'
	});  
		
	/**
	 * Modelli
	 */
	var Quote = mongoose.model('Quote', QuoteSchema),
		UserProfile = mongoose.model('UserProfile', UserProfileSchema),
		History = mongoose.model('History', HistorySchema);
	
	var populateOmniSearch = function() {
		var Utils = require('./Utils'),
			utils = Utils.create(),
			quote;
		
		Quote.find({}, function(err, docs) {
			docs.forEach(function(elem, index, array) {
				elem.omniSearch = utils.getOmniSearch(elem);
				elem.save();				
			});
		});
	};
	
	return {
		Quote: Quote,
		UserProfile: UserProfile,
		History: History,
		populateOmniSearch: populateOmniSearch
	};
};